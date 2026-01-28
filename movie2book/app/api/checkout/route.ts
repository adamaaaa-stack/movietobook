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

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Get user email
    const { data: { user: userData } } = await supabase.auth.getUser();

    // Create PayPal subscription plan
    const planResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        product_id: 'PROD_MOVIE2BOOK', // You'll need to create this product first
        name: 'Movie2Book Pro Monthly',
        description: 'Unlimited video to book conversions',
        status: 'ACTIVE',
        billing_cycles: [
          {
            frequency: {
              interval_unit: 'MONTH',
              interval_count: 1,
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0, // 0 = indefinite
            pricing_scheme: {
              fixed_price: {
                value: '10.00',
                currency_code: 'USD',
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: '0.00',
            currency_code: 'USD',
          },
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      }),
    });

    if (!planResponse.ok) {
      const error = await planResponse.text();
      console.error('PayPal plan creation error:', error);
      throw new Error('Failed to create PayPal plan');
    }

    const plan = await planResponse.json();
    const planId = plan.id;

    // Create PayPal subscription
    const subscriptionResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        plan_id: planId,
        start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
        subscriber: {
          email_address: userData?.email || '',
          name: {
            given_name: userData?.user_metadata?.full_name?.split(' ')[0] || '',
            surname: userData?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          },
        },
        application_context: {
          brand_name: 'Movie2Book',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          return_url: `${request.nextUrl.origin}/dashboard?success=true`,
          cancel_url: `${request.nextUrl.origin}/pricing?canceled=true`,
        },
        custom_id: user.id, // Store user ID for webhook
      }),
    });

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.text();
      console.error('PayPal subscription creation error:', error);
      throw new Error('Failed to create PayPal subscription');
    }

    const subscription = await subscriptionResponse.json();
    
    // Find approval link
    const approvalLink = subscription.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalLink) {
      throw new Error('Failed to get PayPal approval URL');
    }

    return NextResponse.json({ url: approvalLink });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
