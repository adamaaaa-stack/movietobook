import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'No jobId provided' }, { status: 400 });
    }

    // Check Supabase for job status
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const outputPath = join(process.cwd(), 'outputs', `${jobId}.txt`);
    const progressPath = outputPath.replace('.txt', '_progress.json');

    // Try to read progress file first
    try {
      const progressContent = await readFile(progressPath, 'utf-8');
      const progressData = JSON.parse(progressContent);
      
      // Check if progress is 100% with "Completed" status
      const isCompleted = progressData.progress === 100 && 
                         (progressData.status?.toLowerCase() === 'completed' || 
                          progressData.status?.toLowerCase() === 'complete');
      
      // Always check output file first - if it exists, we're done
      try {
        await access(outputPath, constants.F_OK);
        // Output file exists, definitely completed
        await supabase
          .from('jobs')
          .update({ status: 'completed', progress: 100 })
          .eq('id', jobId);
        
        return NextResponse.json({
          status: 'completed',
          progress: 100,
          statusIndex: progressData.status_index || 0,
          chunkProgress: progressData.chunk_progress || { current: 0, total: 1 },
        });
      } catch {
        // Output file doesn't exist yet
        if (isCompleted) {
          // Progress says completed - wait a moment and check again
          // Give it 2 seconds for file to finish writing
          await new Promise(resolve => setTimeout(resolve, 2000));
          try {
            await access(outputPath, constants.F_OK);
            // File exists now
            await supabase
              .from('jobs')
              .update({ status: 'completed', progress: 100 })
              .eq('id', jobId);
            
            return NextResponse.json({
              status: 'completed',
              progress: 100,
              statusIndex: progressData.status_index || 0,
              chunkProgress: progressData.chunk_progress || { current: 0, total: 1 },
            });
          } catch {
            // Still doesn't exist, but progress says completed - return completed anyway
            await supabase
              .from('jobs')
              .update({ status: 'completed', progress: 100 })
              .eq('id', jobId);
            
            return NextResponse.json({
              status: 'completed',
              progress: 100,
              statusIndex: progressData.status_index || 0,
              chunkProgress: progressData.chunk_progress || { current: 0, total: 1 },
            });
          }
        }
        
        // Still processing
        await supabase
          .from('jobs')
          .update({
            progress: progressData.progress,
            status: progressData.status,
            chunk_progress: progressData.chunk_progress,
          })
          .eq('id', jobId);
        
        return NextResponse.json({
          status: progressData.status,
          progress: progressData.progress,
          statusIndex: progressData.status_index || 0,
          chunkProgress: progressData.chunk_progress || { current: 0, total: 1 },
        });
      }
    } catch {
      // Progress file doesn't exist, check output file
      try {
        await access(outputPath, constants.F_OK);
        
        // File exists, processing is complete
        await supabase
          .from('jobs')
          .update({ status: 'completed', progress: 100 })
          .eq('id', jobId);
        
        return NextResponse.json({
          status: 'completed',
          progress: 100,
        });
      } catch {
        // File doesn't exist yet, check log file for errors
        const logPath = outputPath.replace('.txt', '.log');
        try {
          const logContent = await readFile(logPath, 'utf-8');
          // Check if log contains error messages
          if (logContent.includes('Error') || logContent.includes('Traceback') || logContent.includes('ModuleNotFoundError')) {
            return NextResponse.json({
              status: 'error',
              progress: 0,
              error: logContent.substring(0, 500), // First 500 chars of error
              statusIndex: 0,
              chunkProgress: { current: 0, total: 1 },
            });
          }
        } catch {
          // Log file doesn't exist or can't be read, continue
        }
        
        // File doesn't exist yet, still processing
        return NextResponse.json({
          status: job.status || 'processing',
          progress: job.progress || 0, // Start at 0, not 10
          statusIndex: 0,
          chunkProgress: job.chunk_progress || { current: 0, total: 1 },
        });
      }
    }
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  }
}
