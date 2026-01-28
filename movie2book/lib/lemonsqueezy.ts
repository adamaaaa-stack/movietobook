if (!process.env.LEMONSQUEEZY_API_KEY) {
  throw new Error('LEMONSQUEEZY_API_KEY is not set in environment variables');
}

export const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
export const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || '';
export const VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID || '';

if (!STORE_ID || !VARIANT_ID) {
  console.warn('LEMONSQUEEZY_STORE_ID or LEMONSQUEEZY_VARIANT_ID is not set. Lemon Squeezy checkout will not work.');
}
