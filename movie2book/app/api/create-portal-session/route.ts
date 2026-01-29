import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PAYPAL_MODE } from '@/lib/paypal';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('paypal_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!sub?.paypal_subscription_id) {
      return NextResponse.json(
        { error: 'No PayPal subscription found' },
        { status: 400 }
      );
    }

    const base =
      PAYPAL_MODE === 'live'
        ? 'https://www.paypal.com'
        : 'https://www.sandbox.paypal.com';
    const url = `${base}/myaccount/autopay/`;

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
