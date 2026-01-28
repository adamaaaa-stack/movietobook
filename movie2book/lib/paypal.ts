if (!process.env.PAYPAL_CLIENT_ID) {
  console.warn('PAYPAL_CLIENT_ID is not set in environment variables');
}

if (!process.env.PAYPAL_CLIENT_SECRET) {
  console.warn('PAYPAL_CLIENT_SECRET is not set in environment variables');
}

export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
export const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' or 'live'

// PayPal API URLs
export const PAYPAL_BASE_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
export async function getPayPalAccessToken(): Promise<string> {
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
    const error = await response.text();
    throw new Error(`Failed to get PayPal access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}
