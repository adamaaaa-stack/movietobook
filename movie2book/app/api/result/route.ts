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

    const outputPath = join(process.cwd(), 'outputs', `${jobId}.txt`);

    try {
      await access(outputPath, constants.F_OK);
      const content = await readFile(outputPath, 'utf-8');
      
      // File now contains only the story, no need to extract
      const narrative = content.trim();

      // One book per job: update if exists, else insert; then delete any other rows for this job (handles races/double-loads)
      const title = job.video_filename?.replace(/\.[^/.]+$/, '') || 'Video Narrative';
      const { data: existingRows } = await supabase
        .from('books')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .limit(1);
      const existing = existingRows?.[0];
      let keepId: string;
      if (existing?.id) {
        keepId = existing.id;
        await supabase
          .from('books')
          .update({ title, content: narrative, updated_at: new Date().toISOString() })
          .eq('id', keepId);
      } else {
        const { data: inserted } = await supabase
          .from('books')
          .insert({
            job_id: jobId,
            user_id: user.id,
            title,
            content: narrative,
          })
          .select('id')
          .single();
        keepId = inserted?.id ?? '';
      }
      if (keepId) {
        await supabase.from('books').delete().eq('job_id', jobId).eq('user_id', user.id).neq('id', keepId);
      }

      return NextResponse.json({ narrative, title });
    } catch {
      return NextResponse.json(
        { error: 'Result not ready yet' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Result fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    );
  }
}
