import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_PRICE_ID } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID) {
      console.error('Missing Stripe configuration:', {
        hasSecretKey: !!STRIPE_SECRET_KEY,
        hasPriceId: !!STRIPE_PRICE_ID,
      });
      return NextResponse.json(
        { error: 'Stripe not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });

    // Get user email
    const { data: { user: userData } } = await supabase.auth.getUser();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: userData?.email || undefined,
      client_reference_id: user.id,
      success_url: `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${request.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
