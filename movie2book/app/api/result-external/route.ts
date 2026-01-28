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

    // Verify job belongs to user
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Get backend URL (localhost for single app, or external URL for separate apps)
    const externalApiUrl = process.env.EXTERNAL_API_URL || 'http://localhost:8080';

    // Get result from external API
    const response = await fetch(`${externalApiUrl}/api/result/${jobId}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Result not ready yet' },
        { status: 404 }
      );
    }

    const data = await response.json();
    const narrative = data.narrative;

    // Save to Supabase
    await supabase
      .from('books')
      .upsert({
        job_id: jobId,
        user_id: user.id,
        title: job.video_filename?.replace(/\.[^/.]+$/, '') || 'Video Narrative',
        content: narrative,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({ 
      narrative,
      title: job.video_filename?.replace(/\.[^/.]+$/, '') || 'Video Narrative',
    });
  } catch (error: any) {
    console.error('[Result] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch result' },
      { status: 500 }
    );
  }
}
