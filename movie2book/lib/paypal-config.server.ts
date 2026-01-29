/**
 * PayPal config for server-only (webhook, getPayPalAccessToken).
 * Edit with your values, or set env vars on Render: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE, PAYPAL_WEBHOOK_ID.
 */
export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
export const PAYPAL_MODE = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase(); // 'sandbox' or 'live'
export const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';
