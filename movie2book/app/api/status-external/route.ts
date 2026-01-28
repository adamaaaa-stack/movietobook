import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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

    // Get backend URL (localhost for single app, or external URL for separate apps)
    // Use localhost when in same container (Railway single-app), external URL for separate deployments
    const externalApiUrl = process.env.NODE_ENV === 'production' && process.env.EXTERNAL_API_URL 
      ? process.env.EXTERNAL_API_URL 
      : 'http://localhost:8080';

    // Check status from external API
    let response: Response;
    try {
      response = await fetch(`${externalApiUrl}/api/status/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
    } catch (fetchError: any) {
      console.error('[Status] Fetch error:', fetchError);
      // If backend is not accessible, return a default processing status
      return NextResponse.json({
        status: 'processing',
        progress: 0,
        jobId: jobId,
        error: 'Backend API not accessible',
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Status] Backend returned ${response.status}:`, errorText);
      
      // If backend returns 404, job might not exist yet - return processing status
      if (response.status === 404) {
        return NextResponse.json({
          status: 'processing',
          progress: 0,
          jobId: jobId,
        });
      }
      
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: response.status }
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('[Status] JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    // Map external API status to our format
    // If progress is 100%, check if output file exists to confirm completion
    let finalStatus = data.status === 'completed' ? 'completed' : 'processing';
    
    // If progress is 100% but status isn't completed, check output file
    if (data.progress === 100 && finalStatus !== 'completed') {
      try {
        const resultResponse = await fetch(`${externalApiUrl}/api/result/${jobId}`);
        if (resultResponse.ok) {
          finalStatus = 'completed';
        }
      } catch {
        // If we can't check, keep as processing
      }
    }
    
    return NextResponse.json({
      status: finalStatus,
      progress: data.progress || 0,
      jobId: data.job_id || jobId,
      statusIndex: data.statusIndex,
      chunkProgress: data.chunkProgress,
    });
  } catch (error: any) {
    console.error('[Status] Unexpected error:', error);
    console.error('[Status] Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get status',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
