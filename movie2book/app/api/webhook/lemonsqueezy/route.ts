import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = hmac.update(body).digest('hex');

    if (signature !== digest) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const supabase = await createClient();

    try {
      switch (event.meta.event_name) {
        case 'subscription_created':
        case 'subscription_updated':
        case 'subscription_payment_success': {
          const subscription = event.data;
          const customerId = subscription.attributes.customer_id;
          const subscriptionId = subscription.id;
          const status = subscription.attributes.status;
          const customData = subscription.attributes.custom_data || {};
          const userId = customData.user_id;

          if (!userId) {
            console.error('No user_id in custom_data');
            break;
          }

          const subscriptionStatus = status === 'active' || status === 'current' ? 'active' : 'cancelled';

          await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              lemon_squeezy_customer_id: customerId.toString(),
              lemon_squeezy_subscription_id: subscriptionId.toString(),
              status: subscriptionStatus,
            }, {
              onConflict: 'user_id',
            });

          console.log(`Subscription ${subscriptionStatus} for user ${userId}`);
          break;
        }

        case 'subscription_cancelled':
        case 'subscription_expired': {
          const subscription = event.data;
          const customData = subscription.attributes.custom_data || {};
          const userId = customData.user_id;

          if (!userId) {
            console.error('No user_id in custom_data');
            break;
          }

          await supabase
            .from('user_subscriptions')
            .update({
              status: 'cancelled',
            })
            .eq('user_id', userId);

          console.log(`Subscription cancelled for user ${userId}`);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.meta.event_name}`);
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
