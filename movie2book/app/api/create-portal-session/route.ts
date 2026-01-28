import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PAYPAL_BASE_URL, getPayPalAccessToken } from '@/lib/paypal';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's PayPal subscription ID
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('paypal_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle() to handle no rows gracefully

    if (!subData?.paypal_subscription_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Get subscription details to find cancel link
    const subscriptionResponse = await fetch(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subData.paypal_subscription_id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!subscriptionResponse.ok) {
      throw new Error('Failed to fetch subscription details');
    }

    const subscription = await subscriptionResponse.json();
    
    // PayPal doesn't have a direct portal like Stripe
    // Users can manage subscriptions through PayPal account
    // Or we can provide a cancel link
    const cancelLink = subscription.links?.find((link: any) => link.rel === 'cancel')?.href;

    return NextResponse.json({ 
      url: cancelLink || 'https://www.paypal.com/myaccount/autopay',
      message: cancelLink 
        ? 'Click to cancel your subscription'
        : 'Please log into your PayPal account to manage your subscription',
    });
  } catch (error: any) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
