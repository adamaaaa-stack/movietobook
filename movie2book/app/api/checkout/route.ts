import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPayPalAccessToken, getOrCreatePlanId, PAYPAL_BASE_URL } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (req.headers.get('x-forwarded-proto') && req.headers.get('host')
        ? `${req.headers.get('x-forwarded-proto')}://${req.headers.get('host')}`
        : null) ||
      (req.nextUrl && req.nextUrl.origin ? req.nextUrl.origin : 'http://localhost:3000');

    const returnUrl = `${baseUrl}/thanks`;
    const cancelUrl = `${baseUrl}/pricing`;

    const token = await getPayPalAccessToken();
    const planId = await getOrCreatePlanId(token);

    const subscriptionPayload = {
      plan_id: planId,
      start_time: new Date().toISOString(),
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'Movie2Book',
        user_action: 'SUBSCRIBE_NOW',
      },
      custom_id: user.id,
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data.message || data.details?.[0]?.description || `PayPal error ${response.status}`;
      return NextResponse.json({ error: message }, { status: response.status >= 400 ? response.status : 500 });
    }

    const approvalUrl = data.links?.find((l: { rel: string }) => l.rel === 'approve')?.href;
    if (!approvalUrl) {
      return NextResponse.json({ error: 'No approval URL from PayPal' }, { status: 500 });
    }

    return NextResponse.json({ url: approvalUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
