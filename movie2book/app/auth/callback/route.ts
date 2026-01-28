import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);
    
    // Initialize subscription record for new users
    if (user) {
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          status: 'free',
          free_conversions_used: false,
        }, {
          onConflict: 'user_id',
        });
    }
  }

  return NextResponse.redirect(new URL('/upload', requestUrl.origin));
}
