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

    // Check credits / paywall
    const { data: subData, error: subError } = await supabase
      .from('user_subscriptions')
      .select('status, free_conversions_used, books_remaining')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!subData) {
      await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          status: 'free',
          free_conversions_used: false,
        });
    } else {
      const isPaid = subData.status === 'active';
      const hasFreeConversion = !subData.free_conversions_used;
      const booksRemaining = subData.books_remaining ?? 0;
      const hasCredits = isPaid || hasFreeConversion || booksRemaining > 0;

      if (!hasCredits) {
        return NextResponse.json(
          { 
            error: 'No credits',
            details: 'You have no book credits left. Use your free conversion or buy 10 books.',
            code: 'PAYWALL'
          },
          { status: 403 }
        );
      }
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
    await supabase
      .from('jobs')
      .insert({
        id: jobId,
        user_id: user.id,
        video_filename: file.name,
        status: 'processing',
      });

    // Deduct credit: prefer books_remaining, else free conversion
    const { data: currentSub } = await supabase
      .from('user_subscriptions')
      .select('status, free_conversions_used, books_remaining')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPaid = currentSub?.status === 'active';
    const hasFreeConversion = currentSub && !currentSub.free_conversions_used;
    const booksRemaining = currentSub?.books_remaining ?? 0;

    if (booksRemaining > 0) {
      await supabase
        .from('user_subscriptions')
        .update({ books_remaining: booksRemaining - 1, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } else if (!isPaid && hasFreeConversion) {
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
