/**
 * PayPal webhook: ONLY place we grant paid credits.
 * - Use RAW body (req.text()), not req.json() — required for signature verification.
 * - Verify with PayPal API (verify-webhook-signature) before trusting the event.
 * - Only then add books_remaining. Do NOT unlock on redirect or client-side.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPayPalAccessToken, PAYPAL_BASE_URL } from '@/lib/paypal';
import { PAYPAL_WEBHOOK_ID } from '@/lib/paypal-config.server';

const BOOKS_PER_PURCHASE = 10;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(url, key);
}

async function verifyWebhook(req: NextRequest, rawBody: string): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_ID) return false; // never grant credits without webhook verification

  const authAlgo = req.headers.get('paypal-auth-algo');
  const certUrl = req.headers.get('paypal-cert-url');
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionSig = req.headers.get('paypal-transmission-sig');
  const transmissionTime = req.headers.get('paypal-transmission-time');

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false;
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
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
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: body,
    }),
  });

  const verifyData = (await verifyRes.json()) as { verification_status?: string };
  return verifyData.verification_status === 'SUCCESS';
}

export async function POST(req: NextRequest) {
  try {
    // Must use raw body for PayPal signature verification (do not use req.json())
    const rawBody = await req.text();
    const event = JSON.parse(rawBody) as {
      event_type?: string;
      resource?: {
        amount?: { value?: string; currency_code?: string };
        payer?: { email_address?: string; payer_id?: string };
        supplementary_data?: { related_ids?: { order_id?: string } };
      };
    };

    const ok = await verifyWebhook(req, rawBody);
    if (!ok) {
      console.error('[webhook/paypal] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return NextResponse.json({ received: true });
    }

    const resource = event.resource;
    if (!resource) return NextResponse.json({ received: true });

    // Optional: only grant for $10 (10 books) if you have multiple products
    const amount = resource.amount?.value;
    if (amount && parseFloat(amount) < 10) {
      return NextResponse.json({ received: true });
    }

    const payerEmail =
      (resource.payer as { email_address?: string })?.email_address ||
      (resource.payer as { email?: string })?.email;
    if (!payerEmail) {
      console.error('[webhook/paypal] No payer email in resource');
      return NextResponse.json({ received: true });
    }

    const supabase = getSupabaseAdmin();

    // Find user by email (Supabase Auth stores it in auth.users)
    const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const users = listData?.users ?? [];
    const user = users.find((u) => u.email?.toLowerCase() === payerEmail.toLowerCase());
    if (!user) {
      console.error('[webhook/paypal] No user found for email:', payerEmail);
      return NextResponse.json({ received: true });
    }

    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('books_remaining')
      .eq('user_id', user.id)
      .maybeSingle();

    const newTotal = (existing?.books_remaining ?? 0) + BOOKS_PER_PURCHASE;

    if (existing) {
      await supabase
        .from('user_subscriptions')
        .update({ books_remaining: newTotal, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } else {
      await supabase.from('user_subscriptions').insert({
        user_id: user.id,
        status: 'free',
        free_conversions_used: false,
        books_remaining: newTotal,
      });
    }

    console.log('[webhook/paypal] Granted', BOOKS_PER_PURCHASE, 'credits to', user.id);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook/paypal]', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
