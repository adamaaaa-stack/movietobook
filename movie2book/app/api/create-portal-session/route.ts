import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PAYFAST_MODE } from '@/lib/payfast';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's PayFast token
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('payfast_token')
      .eq('user_id', user.id)
      .single();

    if (!subData?.payfast_token) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // PayFast customer portal URL
    // Users manage subscriptions through PayFast's customer portal
    const portalBaseUrl = PAYFAST_MODE === 'live'
      ? 'https://www.payfast.co.za'
      : 'https://sandbox.payfast.co.za';

    // PayFast doesn't have a direct customer portal link like Stripe
    // Users need to log into their PayFast account to manage subscriptions
    // Or you can provide instructions to contact support
    const portalUrl = `${portalBaseUrl}/eng/account/subscriptions`;

    return NextResponse.json({ 
      url: portalUrl,
      message: 'Please log into your PayFast account to manage your subscription',
    });
  } catch (error: any) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
