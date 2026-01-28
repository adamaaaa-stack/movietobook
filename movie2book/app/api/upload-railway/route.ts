import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Upload route that forwards to Railway backend API
 * Works for single app deployment (frontend + backend together)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription/paywall
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('status, free_conversions_used')
      .eq('user_id', user.id)
      .single();

    const isPaid = subData?.status === 'active';
    const hasFreeConversion = subData && !subData.free_conversions_used;

    if (!isPaid && !hasFreeConversion) {
      return NextResponse.json(
        { 
          error: 'Subscription required',
          details: 'You have used your free conversion. Please subscribe to continue.',
          code: 'PAYWALL'
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get backend URL (localhost for single app, or external URL for separate apps)
    const backendUrl = process.env.EXTERNAL_API_URL || process.env.RAILWAY_API_URL || 'http://localhost:8080';

    // Forward to Railway backend
    const backendFormData = new FormData();
    backendFormData.append('video', file);

    const response = await fetch(`${backendUrl}/api/process-video`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to start processing', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    const jobId = data.job_id;

    // Save job to database
    await supabase
      .from('jobs')
      .insert({
        id: jobId,
        user_id: user.id,
        video_filename: file.name,
        status: 'processing',
      });

    // Mark free conversion as used if this is a free user
    if (!isPaid && hasFreeConversion) {
      await supabase
        .from('user_subscriptions')
        .update({ free_conversions_used: true })
        .eq('user_id', user.id);
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
