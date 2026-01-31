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
      // Check if subscription already exists
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!existing) {
        // New user - redirect to dashboard
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            status: 'free',
            free_conversions_used: false,
          }, {
            onConflict: 'user_id',
          });
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
