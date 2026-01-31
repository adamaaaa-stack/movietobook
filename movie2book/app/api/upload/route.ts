import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { spawn, execSync } from 'child_process';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import * as jose from 'jose';

export const runtime = 'nodejs';
export const maxDuration = 600; // 10 minutes for large file uploads
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] Request received');

    // Check disk space before processing
    try {
      const dfOutput = execSync('df -h .', { encoding: 'utf-8' }).split('\n')[1];
      const availableMatch = dfOutput.match(/(\d+(?:\.\d+)?)\s*[GMK]i?\s+(\d+(?:\.\d+)?)%/);
      if (availableMatch) {
        const usedPercent = parseFloat(availableMatch[2]);
        if (usedPercent > 95) {
          console.warn('[Upload] Disk space warning:', usedPercent + '% used');
          return NextResponse.json(
            {
              error: 'Insufficient disk space',
              details: `Disk is ${usedPercent.toFixed(1)}% full. Please free up space before uploading.`
            },
            { status: 507 }
          );
        }
      }
    } catch {
      // Disk check failed, continue anyway
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let effectiveUserId: string;
    let db: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAdminClient> = supabase;
    let booksRemaining = 0;
    let isPaid = false;
    let hasFreeConversion = false;

    if (user) {
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('status, free_conversions_used, books_remaining')
        .eq('user_id', user.id)
        .maybeSingle();
      const supabaseCredits = subData?.books_remaining ?? 0;
      const supabasePaid = subData?.status === 'active';
      const supabaseFree = subData ? !subData.free_conversions_used : false;
      if (supabaseCredits > 0 || supabasePaid || supabaseFree) {
        effectiveUserId = user.id;
        db = supabase;
        booksRemaining = supabaseCredits;
        isPaid = supabasePaid;
        hasFreeConversion = supabaseFree;
      } else {
        effectiveUserId = user.id; // default; override below if Gumroad has credits
        // Supabase user has no credits — check Gumroad cookie (no need to match email)
        const token = request.cookies.get('m2b_auth')?.value;
        if (token && process.env.NEXTAUTH_SECRET) {
          try {
            const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
            const { payload } = await jose.jwtVerify(token, secret);
            let gumroadUserId = (payload as { userId?: string }).userId;
            if (!gumroadUserId && (payload as { email?: string }).email) {
              const admin = createAdminClient();
              const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
              const byEmail = list?.users?.find((u) => u.email?.toLowerCase() === (payload as { email?: string }).email?.toLowerCase());
              if (byEmail) gumroadUserId = byEmail.id;
            }
            if (gumroadUserId) {
              const admin = createAdminClient();
              const { data: gumroadSub } = await admin
                .from('user_subscriptions')
                .select('status, free_conversions_used, books_remaining')
                .eq('user_id', gumroadUserId)
                .maybeSingle();
              const gumroadCredits = gumroadSub?.books_remaining ?? 0;
              if (gumroadCredits > 0) {
                effectiveUserId = gumroadUserId;
                db = admin;
                booksRemaining = gumroadCredits;
                isPaid = gumroadSub?.status === 'active';
                hasFreeConversion = gumroadSub ? !gumroadSub.free_conversions_used : false;
              }
            }
          } catch {
            // no Gumroad session
          }
        }
        if (booksRemaining <= 0 && !isPaid && !hasFreeConversion) {
          effectiveUserId = user.id;
          db = supabase;
          booksRemaining = supabaseCredits;
          isPaid = supabasePaid;
          hasFreeConversion = supabaseFree;
        }
      }
    } else {
      const token = request.cookies.get('m2b_auth')?.value;
      if (!token || !process.env.NEXTAUTH_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      try {
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        const userId = (payload as { userId?: string }).userId;
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const admin = createAdminClient();
        const { data: subData } = await admin
          .from('user_subscriptions')
          .select('status, free_conversions_used, books_remaining')
          .eq('user_id', userId)
          .maybeSingle();
        booksRemaining = subData?.books_remaining ?? 0;
        isPaid = subData?.status === 'active';
        hasFreeConversion = subData ? !subData.free_conversions_used : false;
        if (booksRemaining <= 0 && !isPaid && !hasFreeConversion) {
          return NextResponse.json(
            { error: 'No credits', details: 'You have no book credits left. Buy 10 books to continue.', code: 'PAYWALL' },
            { status: 403 }
          );
        }
        effectiveUserId = userId;
        db = admin;
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const hasCredits = isPaid || hasFreeConversion || booksRemaining > 0;
    if (!hasCredits) {
      console.log('[Upload] User hit paywall');
      return NextResponse.json(
        {
          error: 'No credits',
          details: 'You have no book credits left. Buy 10 books to continue.',
          code: 'PAYWALL'
        },
        { status: 403 }
      );
    }

    console.log('[Upload] User authenticated:', effectiveUserId);

    const formData = await request.formData();
    console.log('[Upload] FormData received');
    
    const file = formData.get('video') as File;

    if (!file) {
      console.error('[Upload] No file in formData');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('[Upload] File received:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Save file with streaming for large files
    console.log('Saving file to:', uploadsDir);
    console.log('File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    const filePath = join(uploadsDir, `${jobId}.mp4`);
    
    try {
      // For large files, use streaming write
      const stream = file.stream();
      const chunks: Uint8Array[] = [];
      
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      
      // Combine chunks and write
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)), totalLength);
      await writeFile(filePath, buffer);
      console.log('File saved successfully:', filePath);
    } catch (writeError: any) {
      console.error('Error saving file:', writeError);
      return NextResponse.json(
        { 
          error: 'Failed to save file',
          details: writeError?.message || 'File write failed. Check disk space and permissions.'
        },
        { status: 500 }
      );
    }

    // Save job to Supabase (don't fail if table doesn't exist yet)
    try {
      const { error: dbError } = await db
        .from('jobs')
        .insert({
          id: jobId,
          user_id: effectiveUserId,
          status: 'processing',
          video_filename: file.name,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('Database error (non-fatal, continuing anyway):', dbError);
        // Continue even if DB insert fails - user can still process video
      }
    } catch (dbErr: any) {
      console.error('Database insert error (non-fatal, continuing anyway):', dbErr?.message || dbErr);
      // Continue processing even if DB fails
    }

    // Start processing in background
    const outputPath = join(process.cwd(), 'outputs', `${jobId}.txt`);
    await mkdir(join(process.cwd(), 'outputs'), { recursive: true });
    
    const scriptPath = join(process.cwd(), '..', 'video_to_narrative.py');
    const venvPython = join(process.cwd(), '..', 'venv', 'bin', 'python3');
    
    // Use system python3 (no venv required)
    const fs = await import('fs/promises');
    let pythonPath = 'python3';
    let pythonWorks = false;
    
    // Test if system python3 has required packages
    try {
      execSync(`python3 -c "import cv2; import openai; import dotenv"`, { 
        timeout: 5000,
        stdio: 'pipe'
      });
      pythonWorks = true;
      console.log('✓ Using system python3');
    } catch (testError: any) {
      console.warn('⚠️  System python3 missing required packages');
      console.warn('Error:', testError?.message?.substring(0, 200) || testError);
      
      // Try python3.11 specifically
      try {
        execSync(`python3.11 -c "import cv2; import openai; import dotenv"`, { 
          timeout: 5000,
          stdio: 'pipe'
        });
        pythonPath = 'python3.11';
        pythonWorks = true;
        console.log('✓ Using python3.11');
      } catch {
        // Packages not installed
      }
    }
    
    if (!pythonWorks) {
      return NextResponse.json(
        { 
          error: 'Python packages not installed',
          details: 'Required packages (opencv-python, openai, python-dotenv) are not installed.',
          hint: 'Install with: pip3 install opencv-python openai python-dotenv openai-whisper'
        },
        { status: 500 }
      );
    }

    // Verify script exists
    try {
      await fs.access(scriptPath);
    } catch {
      console.error('Python script not found at:', scriptPath);
      return NextResponse.json(
        { error: 'Processing script not found' },
        { status: 500 }
      );
    }

    console.log('Starting Python script:', pythonPath, scriptPath);
    console.log('Output will be saved to:', outputPath);
    console.log('Video file path:', filePath);
    
    // Create a log file for the Python script output
    const logPath = join(process.cwd(), 'outputs', `${jobId}.log`);
    const logFileHandle = await fs.open(logPath, 'w');
    
    try {
      const childProcess = spawn(
        pythonPath,
        [scriptPath, filePath, '-o', outputPath],
        { 
          cwd: join(process.cwd(), '..'),
          detached: true,  // Detach so it can run in background
          stdio: ['ignore', logFileHandle.fd, logFileHandle.fd]
        }
      );
      
      // Don't wait - let it run in background
      // The process will write to the log file
      
      // Check if process is still running
      if (childProcess.killed || childProcess.exitCode !== null) {
        await logFileHandle.close();
        const logContent = await fs.readFile(logPath, 'utf-8');
        console.error('Script failed immediately. Log:', logContent);
        return NextResponse.json(
          { 
            error: 'Failed to start processing script',
            details: logContent.substring(0, 500) // First 500 chars of error
          },
          { status: 500 }
        );
      }
      
      // Process is running, detach it
      childProcess.unref();
      await logFileHandle.close();
      console.log('✅ Processing started in background, PID:', childProcess.pid);
      console.log('Log file:', logPath);

      // Deduct credit: prefer books_remaining, else free conversion
      if (booksRemaining > 0) {
        await db
          .from('user_subscriptions')
          .update({ books_remaining: booksRemaining - 1, updated_at: new Date().toISOString() })
          .eq('user_id', effectiveUserId);
        console.log('[Upload] Deducted 1 book credit');
      } else if (!isPaid && hasFreeConversion) {
        await db
          .from('user_subscriptions')
          .update({ free_conversions_used: true })
          .eq('user_id', effectiveUserId);
        console.log('[Upload] Marked free conversion as used');
      }
    } catch (spawnError: any) {
      await logFileHandle.close();
      const logContent = await fs.readFile(logPath, 'utf-8').catch(() => '');
      console.error('Failed to start processing:', spawnError?.message || spawnError);
      console.error('Log content:', logContent);
      return NextResponse.json(
        { 
          error: 'Failed to start processing',
          details: spawnError?.message || String(spawnError),
          log: logContent.substring(0, 500)
        },
        { status: 500 }
      );
    }

    console.log('Upload completed successfully, jobId:', jobId);
    return NextResponse.json({ jobId, status: 'processing' });
  } catch (error: any) {
    console.error('[Upload] Fatal error:', error);
    console.error('[Upload] Error stack:', error?.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Upload failed', 
        details: error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
