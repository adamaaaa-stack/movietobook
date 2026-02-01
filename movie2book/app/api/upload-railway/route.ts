import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CREDITS_PER_CONVERSION } from '@/lib/credits';
import * as jose from 'jose';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Upload route that forwards to Railway backend API
 * Works for single app deployment (frontend + backend together)
 * Supports Supabase auth or Gumroad license cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let effectiveUserId: string;
    let db: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAdminClient> = supabase;
    let booksRemaining = 0;
    let isPaid = false;
    let hasFreeConversion = false;

    if (user) {
      effectiveUserId = user.id;
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('status, free_conversions_used, books_remaining')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!subData) {
        await supabase.from('user_subscriptions').insert({
          user_id: user.id,
          status: 'free',
          free_conversions_used: false,
        });
      } else {
        isPaid = subData.status === 'active';
        hasFreeConversion = !subData.free_conversions_used;
        booksRemaining = subData.books_remaining ?? 0;
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
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json(
        { error: 'No credits', details: 'You have no book credits left. Buy 10 books to continue.', code: 'PAYWALL' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get backend URL (use localhost when in same container, external URL for separate deployments)
    // In Railway single-app deployment, use localhost since both services run in same container
    const backendUrl = process.env.NODE_ENV === 'production' && process.env.EXTERNAL_API_URL 
      ? process.env.EXTERNAL_API_URL 
      : 'http://localhost:8080';

    // Check if backend is accessible before uploading
    try {
      const healthCheck = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      if (!healthCheck.ok) {
        console.warn(`[Upload] Backend health check failed: ${healthCheck.status}`);
      }
    } catch (healthError) {
      console.error(`[Upload] Backend health check error:`, healthError);
      return NextResponse.json(
        { 
          error: 'Backend API is not accessible',
          details: `Cannot connect to backend at ${backendUrl}. Please ensure the Python API server is running.`,
        },
        { status: 503 }
      );
    }

    // Forward to Railway backend
    const backendFormData = new FormData();
    backendFormData.append('video', file);

    let response: Response;
    try {
      response = await fetch(`${backendUrl}/api/process-video`, {
        method: 'POST',
        body: backendFormData,
        // Add timeout signal
        signal: AbortSignal.timeout(300000), // 5 minutes for large files
      });
    } catch (fetchError: any) {
      console.error('[Upload] Backend fetch error:', fetchError);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout: File is too large or backend is not responding' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { 
          error: 'Failed to connect to backend API',
          details: `Backend at ${backendUrl} is not accessible. ${fetchError.message}`,
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      console.error('[Upload] Backend error response:', error);
      return NextResponse.json(
        { error: 'Failed to start processing', details: error.substring(0, 200) },
        { status: response.status }
      );
    }

    const data = await response.json();
    const jobId = data.job_id;

    // Save job to database
    await db
      .from('jobs')
      .insert({
        id: jobId,
        user_id: effectiveUserId,
        video_filename: file.name,
        status: 'processing',
      });

    // 1 book = -1 credit (use admin so RLS doesn't block update)
    const admin = createAdminClient();
    if (booksRemaining > 0) {
      const { error: updateError } = await admin
        .from('user_subscriptions')
        .update({ books_remaining: booksRemaining - CREDITS_PER_CONVERSION, updated_at: new Date().toISOString() })
        .eq('user_id', effectiveUserId);
      if (updateError) {
        console.error('[Upload] Credit deduction failed', updateError.message);
        return NextResponse.json(
          { error: 'Failed to deduct credit', details: updateError.message },
          { status: 500 }
        );
      }
      console.log('[Upload] Deducted', CREDITS_PER_CONVERSION, 'credit(s)');
    } else if (!isPaid && hasFreeConversion) {
      const { error: updateError } = await admin
        .from('user_subscriptions')
        .update({ free_conversions_used: true })
        .eq('user_id', effectiveUserId);
      if (updateError) {
        console.error('[Upload] Free conversion update failed', updateError.message);
      }
    }

    return NextResponse.json({ jobId, status: 'processing' });
  } catch (error: any) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
