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
    const response = await fetch(`${externalApiUrl}/api/status/${jobId}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get status' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Map external API status to our format
    return NextResponse.json({
      status: data.status === 'completed' ? 'completed' : 'processing',
      progress: data.progress || 0,
      jobId: data.job_id,
    });
  } catch (error: any) {
    console.error('[Status] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get status' },
      { status: 500 }
    );
  }
}
