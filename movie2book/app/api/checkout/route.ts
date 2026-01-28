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

    // Check PayPal configuration
    const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = await import('@/lib/paypal');
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('PayPal not configured:', {
        hasClientId: !!PAYPAL_CLIENT_ID,
        hasClientSecret: !!PAYPAL_CLIENT_SECRET,
      });
      return NextResponse.json(
        { error: 'PayPal not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Get PayPal access token
    let accessToken: string;
    try {
      accessToken = await getPayPalAccessToken();
    } catch (error: any) {
      console.error('PayPal access token error:', error);
      return NextResponse.json(
        { error: 'Failed to authenticate with PayPal. Please check your credentials.' },
        { status: 500 }
      );
    }

    // Get user email
    const { data: { user: userData } } = await supabase.auth.getUser();

    // Create or get PayPal product first
    let productId = process.env.PAYPAL_PRODUCT_ID;
    
    if (!productId) {
      // Create product if not exists
      const productResponse = await fetch(`${PAYPAL_BASE_URL}/v1/catalogs/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Movie2Book Pro',
          description: 'Unlimited video to book conversions',
          type: 'SERVICE',
          category: 'SOFTWARE',
        }),
      });

      if (!productResponse.ok) {
        const error = await productResponse.text();
        console.error('PayPal product creation error:', error);
        // Try to continue - product might already exist
        // Use a default product ID or create one manually
        productId = 'PROD_MOVIE2BOOK';
      } else {
        const product = await productResponse.json();
        productId = product.id;
      }
    }

    // If still no product ID, use default
    if (!productId) {
      productId = 'PROD_MOVIE2BOOK';
    }

    // Create PayPal subscription plan
    const planResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        product_id: productId || 'PROD_MOVIE2BOOK',
        name: 'Movie2Book Pro Monthly',
        description: 'Unlimited video to book conversions - Monthly Subscription',
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
