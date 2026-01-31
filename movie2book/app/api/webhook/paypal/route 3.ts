import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPayPalAccessToken, PAYPAL_BASE_URL } from '@/lib/paypal';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service role config');
  return createClient(url, key);
}

async function verifyWebhook(
  req: NextRequest,
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return true;

  const authAlgo = req.headers.get('paypal-auth-algo');
  const certUrl = req.headers.get('paypal-cert-url');
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionSig = req.headers.get('paypal-transmission-sig');
  const transmissionTime = req.headers.get('paypal-transmission-time');

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false;
  }

  const token = await getPayPalAccessToken();
  const verifyRes = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });

  const verifyData = await verifyRes.json();
  return verifyData.verification_status === 'SUCCESS';
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody) as {
      event_type: string;
      resource?: { id?: string; custom_id?: string; status?: string };
    };

    const ok = await verifyWebhook(req, rawBody);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const subscriptionId = event.resource?.id;

    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED' && subscriptionId) {
      const token = await getPayPalAccessToken();
      const subRes = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subData = await subRes.json();
      const userId = subData.custom_id || event.resource?.custom_id;
      if (!userId) {
        console.error('PayPal webhook: no user id in subscription', subscriptionId);
        return NextResponse.json({ received: true });
      }

      const { error: upsertError } = await supabase.from('user_subscriptions').upsert(
        {
          user_id: userId,
          status: 'active',
          paypal_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (upsertError) console.error('PayPal webhook upsert:', upsertError);
    } else if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' && subscriptionId) {
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('paypal_subscription_id', subscriptionId);
      if (updateError) console.error('PayPal webhook cancel:', updateError);
    } else if (event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED' && subscriptionId) {
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('paypal_subscription_id', subscriptionId);
      if (updateError) console.error('PayPal webhook suspend:', updateError);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('PayPal webhook error:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
