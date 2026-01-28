import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PAYPAL_BASE_URL, getPayPalAccessToken } from '@/lib/paypal';

export const dynamic = 'force-dynamic';

// Verify PayPal webhook signature
async function verifyPayPalWebhook(
  headers: Headers,
  body: string,
  webhookId: string
): Promise<boolean> {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const verifyResponse = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers.get('paypal-auth-algo'),
        cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'),
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    });

    if (!verifyResponse.ok) {
      console.error('PayPal webhook verification failed');
      return false;
    }

    const verification = await verifyResponse.json();
    return verification.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal webhook verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!webhookId) {
      console.error('PAYPAL_WEBHOOK_ID not set');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(request.headers, body, webhookId);

    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();
    const eventType = event.event_type;
    const resource = event.resource;

    try {
      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.CREATED':
        case 'BILLING.SUBSCRIPTION.ACTIVATED': {
          const subscriptionId = resource.id;
          const customId = resource.custom_id; // User ID

          if (!customId) {
            console.error('No custom_id in subscription');
            break;
          }

          await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: customId,
              paypal_subscription_id: subscriptionId,
              status: 'active',
            }, {
              onConflict: 'user_id',
            });

          console.log(`Subscription activated for user ${customId}`);
          break;
        }

        case 'BILLING.SUBSCRIPTION.CANCELLED':
        case 'BILLING.SUBSCRIPTION.EXPIRED':
        case 'BILLING.SUBSCRIPTION.SUSPENDED': {
          const subscriptionId = resource.id;

          // Find user by subscription ID
          const { data: subData } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('paypal_subscription_id', subscriptionId)
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

        case 'PAYMENT.SALE.COMPLETED': {
          // Payment completed - subscription is active
          const billingAgreementId = resource.billing_agreement_id;

          if (billingAgreementId) {
            const { data: subData } = await supabase
              .from('user_subscriptions')
              .select('user_id')
              .eq('paypal_subscription_id', billingAgreementId)
              .single();

            if (subData) {
              await supabase
                .from('user_subscriptions')
                .update({
                  status: 'active',
                })
                .eq('user_id', subData.user_id);
            }
          }
          break;
        }

        default:
          console.log(`Unhandled PayPal event type: ${eventType}`);
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
