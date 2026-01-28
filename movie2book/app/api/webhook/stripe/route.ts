import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
}) : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.client_reference_id || session.metadata?.user_id;

          if (!userId) {
            console.error('No user_id in checkout session');
            break;
          }

          // Get customer and subscription from session
          const customerId = typeof session.customer === 'string' 
            ? session.customer 
            : session.customer?.id;

          if (session.mode === 'subscription' && session.subscription) {
            const subscriptionId = typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;

            await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: 'active',
              }, {
                onConflict: 'user_id',
              });

            console.log(`Subscription activated for user ${userId}`);
          }
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

          // Find user by customer ID
          const { data: subData } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (subData) {
            const subscriptionStatus = subscription.status === 'active' 
              ? 'active' 
              : subscription.status === 'canceled' || subscription.status === 'unpaid'
              ? 'cancelled'
              : 'active';

            await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: subData.user_id,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                status: subscriptionStatus,
              }, {
                onConflict: 'user_id',
              });

            console.log(`Subscription ${subscriptionStatus} for user ${subData.user_id}`);
          }
          break;
        }

        case 'customer.subscription.deleted':
        case 'invoice.payment_failed': {
          const subscription = event.data.object as Stripe.Subscription | Stripe.Invoice;
          const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

          // Find user by customer ID
          const { data: subData } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (subData) {
            await supabase
              .from('user_subscriptions')
              .update({
                status: 'cancelled',
              })
              .eq('user_id', subData.user_id);

            console.log(`Subscription cancelled for user ${subData.user_id}`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return NextResponse.json({ received: true });
    } catch (error: any) {
      console.error('Webhook handler error:', error);
      return NextResponse.json(
        { error: 'Webhook handler failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
