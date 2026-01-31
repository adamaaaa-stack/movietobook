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
  // Validate credentials are set
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `PayPal authentication failed (${response.status})`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error_description || errorJson.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`;
      }
      
      // Log detailed error for debugging
      console.error('PayPal auth error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        hasClientId: !!PAYPAL_CLIENT_ID,
        hasClientSecret: !!PAYPAL_CLIENT_SECRET,
        mode: PAYPAL_MODE,
        baseUrl: PAYPAL_BASE_URL,
      });
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('PayPal returned invalid response: missing access_token');
    }
    
    return data.access_token;
  } catch (error: any) {
    if (error.message.includes('PayPal')) {
      throw error;
    }
    throw new Error(`PayPal authentication error: ${error.message}`);
  }
}
