if (!process.env.PAYPAL_CLIENT_ID) {
  console.warn('PAYPAL_CLIENT_ID is not set in environment variables');
}
if (!process.env.PAYPAL_CLIENT_SECRET) {
  console.warn('PAYPAL_CLIENT_SECRET is not set in environment variables');
}

export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
export const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

export const PAYPAL_BASE_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

export async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `PayPal authentication failed (${response.status})`;
    try {
      const err = JSON.parse(text);
      if (err.error_description) errorMessage = err.error_description;
    } catch (_) {}
    console.error('PayPal auth error:', {
      status: response.status,
      text: text.slice(0, 200),
      mode: PAYPAL_MODE,
      hasClientId: !!PAYPAL_CLIENT_ID,
      hasClientSecret: !!PAYPAL_CLIENT_SECRET,
    });
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('PayPal returned invalid response: missing access_token');
  }
  return data.access_token;
}

const PLAN_CACHE_KEY = 'paypal_plan_id';

export async function getOrCreatePlanId(accessToken: string): Promise<string> {
  const envPlanId = process.env.PAYPAL_PLAN_ID;
  if (envPlanId) return envPlanId;

  const global = globalThis as typeof globalThis & { [PLAN_CACHE_KEY]?: string };
  if (global[PLAN_CACHE_KEY]) return global[PLAN_CACHE_KEY];

  const productRes = await fetch(`${PAYPAL_BASE_URL}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Movie2Book Monthly',
      description: 'Unlimited video conversions',
      type: 'SERVICE',
    }),
  });
  if (!productRes.ok) {
    const t = await productRes.text();
    throw new Error(`PayPal create product failed: ${t}`);
  }
  const productData = (await productRes.json()) as { id: string };
  const productId = productData.id;

  const planRes = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      name: 'Movie2Book $10/month',
      description: 'Unlimited conversions',
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: '10', currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });
  if (!planRes.ok) {
    const t = await planRes.text();
    throw new Error(`PayPal create plan failed: ${t}`);
  }
  const planData = (await planRes.json()) as { id: string };
  const planId = planData.id;
  global[PLAN_CACHE_KEY] = planId;
  return planId;
}
