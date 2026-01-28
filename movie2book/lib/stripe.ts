if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set in environment variables');
}

if (!process.env.STRIPE_PRICE_ID) {
  console.warn('STRIPE_PRICE_ID is not set. Stripe checkout will not work.');
}

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
