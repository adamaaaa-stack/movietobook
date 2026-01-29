/**
 * Server-only PayPal helpers (webhook verification, etc.).
 * Reads from lib/paypal-config.server.ts (no env vars).
 */

import {
  PAYPAL_CLIENT_ID as CONFIG_CLIENT_ID,
  PAYPAL_CLIENT_SECRET as CONFIG_SECRET,
  PAYPAL_MODE as CONFIG_MODE,
} from './paypal-config.server';

export const PAYPAL_MODE = CONFIG_MODE || 'sandbox';
export const PAYPAL_BASE_URL =
  PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = CONFIG_CLIENT_ID;
  const clientSecret = CONFIG_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Edit lib/paypal-config.server.ts with PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${text}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('PayPal auth: no access_token');
  return data.access_token;
}
