# Lemon Squeezy Payment Integration Setup

## Prerequisites

1. Create a Lemon Squeezy account at https://lemonsqueezy.com
2. Create a store in your Lemon Squeezy dashboard
3. Create a product with a $10/month subscription variant

## Environment Variables

Add these to your `.env.local` file:

```bash
# Lemon Squeezy Keys
LEMONSQUEEZY_API_KEY=your_api_key_here  # Get from Lemon Squeezy Dashboard > Settings > API
LEMONSQUEEZY_STORE_ID=your_store_id  # Get from your store URL or API
LEMONSQUEEZY_VARIANT_ID=your_variant_id  # Get from product variant page
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret  # Get after setting up webhook
```

## Setting Up Lemon Squeezy Products

1. Go to Lemon Squeezy Dashboard > Products
2. Click "Create Product"
3. Set name: "Movie2Book Pro"
4. Set price: $10.00 USD
5. Set billing period: Monthly
6. Copy the Variant ID (visible in the URL or product page)
7. Copy the Store ID (from your store settings or URL)

## Setting Up Webhooks

1. Go to Lemon Squeezy Dashboard > Settings > Webhooks
2. Click "Create Webhook"
3. Set endpoint URL: `https://yourdomain.com/api/webhook/lemonsqueezy` (or `http://localhost:3000/api/webhook/lemonsqueezy` for local testing with ngrok)
4. Select events to listen for:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_payment_success`
   - `subscription_cancelled`
   - `subscription_expired`
5. Copy the webhook signing secret and add it to `LEMONSQUEEZY_WEBHOOK_SECRET`

## Supabase Database Setup

Run the migration SQL in `supabase_migration_lemonsqueezy.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard > SQL Editor
2. Paste the contents of `supabase_migration_lemonsqueezy.sql`
3. Run the query

This creates/updates the `user_subscriptions` table with:
- `user_id` (references auth.users)
- `status` (free, active, cancelled)
- `free_conversions_used` (boolean)
- `lemon_squeezy_customer_id`
- `lemon_squeezy_subscription_id`

## Testing

### Local Testing with ngrok

1. Install ngrok: https://ngrok.com
2. Start your Next.js dev server: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Set webhook endpoint in Lemon Squeezy to: `https://abc123.ngrok.io/api/webhook/lemonsqueezy`
6. Use test mode in Lemon Squeezy for testing

### Test Mode

Lemon Squeezy has a test mode. Use test API keys and test products for development.

## Flow

1. **New User Sign Up**: Gets `status: 'free'` and `free_conversions_used: false`
2. **First Conversion**: Free conversion is used, `free_conversions_used` set to `true`
3. **Subscribe**: User clicks "Subscribe" → Lemon Squeezy Checkout → Webhook updates `status: 'active'` and stores `lemon_squeezy_customer_id`
4. **Unlimited Conversions**: Active subscribers can convert unlimited videos
5. **Cancel**: User cancels in Lemon Squeezy Customer Portal → Webhook updates `status: 'cancelled'`

## Customer Portal

The "Manage Subscription" button links to:
`https://app.lemonsqueezy.com/my-account/subscriptions?customer={customer_id}`

This is Lemon Squeezy's hosted customer portal where users can:
- View subscription details
- Update payment method
- Cancel subscription
- View billing history

## Troubleshooting

- **Webhook not working**: 
  - Check that the webhook secret matches
  - Verify the endpoint URL is accessible (use ngrok for local testing)
  - Check Lemon Squeezy Dashboard > Webhooks for delivery logs

- **Subscription not updating**: 
  - Check Lemon Squeezy Dashboard > Webhooks for event logs
  - Verify `custom_data.user_id` is being passed in checkout
  - Check server logs for webhook processing errors

- **Checkout not working**: 
  - Verify `LEMONSQUEEZY_STORE_ID` and `LEMONSQUEEZY_VARIANT_ID` are correct
  - Check API key has correct permissions
  - Ensure you're using the correct API key (test vs live)

- **Paywall not showing**: 
  - Check that `user_subscriptions` table exists and has correct RLS policies
  - Verify subscription status is being checked correctly

## API Reference

- Lemon Squeezy API Docs: https://docs.lemonsqueezy.com/api
- Checkout API: https://docs.lemonsqueezy.com/api/checkouts
- Webhooks: https://docs.lemonsqueezy.com/help/webhooks
