import { NextResponse } from 'next/server';

/**
 * Returns PayPal client ID for the frontend. Used when lib/paypal-config.client has empty PAYPAL_CLIENT_ID
 * (e.g. on Render with PAYPAL_CLIENT_ID env var set).
 */
export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  return NextResponse.json({ clientId });
}
