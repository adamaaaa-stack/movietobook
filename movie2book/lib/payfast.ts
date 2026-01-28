if (!process.env.PAYFAST_MERCHANT_ID) {
  console.warn('PAYFAST_MERCHANT_ID is not set in environment variables');
}

if (!process.env.PAYFAST_MERCHANT_KEY) {
  console.warn('PAYFAST_MERCHANT_KEY is not set in environment variables');
}

if (!process.env.PAYFAST_PASSPHRASE) {
  console.warn('PAYFAST_PASSPHRASE is not set in environment variables');
}

export const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
export const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
export const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
export const PAYFAST_MODE = process.env.PAYFAST_MODE || 'sandbox'; // 'sandbox' or 'live'

// PayFast URLs
export const PAYFAST_URL = PAYFAST_MODE === 'live' 
  ? 'https://www.payfast.co.za/eng/process'
  : 'https://sandbox.payfast.co.za/eng/process';

export const PAYFAST_ITN_URL = PAYFAST_MODE === 'live'
  ? 'https://www.payfast.co.za/eng/query/validate'
  : 'https://sandbox.payfast.co.za/eng/query/validate';
