# Lemon Squeezy Setup - CLI Guide

Follow these steps to set up Lemon Squeezy payments for Movie2Book.

## Step 1: Create Lemon Squeezy Account

1. Go to https://lemonsqueezy.com
2. Sign up for an account
3. Verify your email

## Step 2: Get Your API Key

1. Log into Lemon Squeezy Dashboard
2. Go to **Settings** → **API**
3. Click **"Create API Key"**
4. Give it a name (e.g., "Movie2Book Production")
5. Copy the API key (you'll only see it once!)

```bash
# Save this for later - we'll add it to .env.local
LEMONSQUEEZY_API_KEY=your_api_key_here
```

## Step 3: Create a Store

1. In Lemon Squeezy Dashboard, go to **Stores**
2. If you don't have a store, click **"Create Store"**
3. Fill in:
   - Store name: "Movie2Book Store"
   - Store URL: your domain (or leave default)
4. Copy your **Store ID** (visible in the URL or store settings)

```bash
# Example Store ID format: 12345
LEMONSQUEEZY_STORE_ID=your_store_id
```

## Step 4: Create Product & Variant

1. Go to **Products** → **"Create Product"**
2. Fill in:
   - **Name**: "Movie2Book Pro"
   - **Description**: "Unlimited video to book conversions"
   - **Price**: $10.00 USD
   - **Billing Period**: Monthly (recurring)
3. Click **"Create Product"**
4. On the product page, you'll see a **Variant** was created automatically
5. Click on the variant to see its details
6. Copy the **Variant ID** (from URL or variant page)

```bash
# Example Variant ID format: 67890
LEMONSQUEEZY_VARIANT_ID=your_variant_id
```

## Step 5: Set Up Webhook (For Production)

### Option A: Production (Vercel/Railway)

1. Go to **Settings** → **Webhooks**
2. Click **"Create Webhook"**
3. Set endpoint URL:
   ```
   https://yourdomain.com/api/webhook/lemonsqueezy
   ```
   (Replace `yourdomain.com` with your actual domain)
4. Select these events:
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `subscription_payment_success`
   - ✅ `subscription_cancelled`
   - ✅ `subscription_expired`
5. Click **"Create Webhook"**
6. Copy the **Webhook Signing Secret**

```bash
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

### Option B: Local Testing (ngrok)

1. Install ngrok:
   ```bash
   brew install ngrok
   # or download from https://ngrok.com
   ```

2. Start your Next.js dev server:
   ```bash
   cd movie2book
   npm run dev
   ```

3. In another terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. In Lemon Squeezy Dashboard → **Settings** → **Webhooks**:
   - Create webhook with URL: `https://abc123.ngrok.io/api/webhook/lemonsqueezy`
   - Select the same events as above
   - Copy the webhook secret

## Step 6: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Navigate to your project
cd /Users/oogy/Documents/movietobook/movie2book

# Edit .env.local (or create it if it doesn't exist)
nano .env.local
# or
code .env.local
```

Add these lines:

```env
# Lemon Squeezy Configuration
LEMONSQUEEZY_API_KEY=your_api_key_from_step_2
LEMONSQUEEZY_STORE_ID=your_store_id_from_step_3
LEMONSQUEEZY_VARIANT_ID=your_variant_id_from_step_4
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_from_step_5
```

## Step 7: Set Up Supabase Database

Run the migration SQL in your Supabase dashboard:

1. Go to Supabase Dashboard → **SQL Editor**
2. Open `supabase_migration_lemonsqueezy.sql` from your project
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **"Run"**

Or use Supabase CLI:

```bash
# If you have Supabase CLI installed
supabase db push
```

## Step 8: Test the Integration

### Test Checkout Flow:

1. Start your dev server:
   ```bash
   cd movie2book
   npm run dev
   ```

2. Open http://localhost:3000
3. Sign up or log in
4. Go to `/pricing` page
5. Click **"Subscribe"**
6. You should be redirected to Lemon Squeezy checkout

### Test Webhook (Local):

1. Make sure ngrok is running (`ngrok http 3000`)
2. Complete a test purchase in Lemon Squeezy test mode
3. Check your terminal logs for webhook events
4. Check Supabase `user_subscriptions` table - status should update to `active`

## Step 9: Deploy to Production

### For Vercel:

```bash
# Add environment variables in Vercel Dashboard:
# Settings → Environment Variables

# Or use Vercel CLI:
vercel env add LEMONSQUEEZY_API_KEY
vercel env add LEMONSQUEEZY_STORE_ID
vercel env add LEMONSQUEEZY_VARIANT_ID
vercel env add LEMONSQUEEZY_WEBHOOK_SECRET

# Deploy
vercel --prod
```

### For Railway:

```bash
# Add environment variables in Railway Dashboard:
# Your Service → Variables

# Or use Railway CLI:
railway variables set LEMONSQUEEZY_API_KEY=your_key
railway variables set LEMONSQUEEZY_STORE_ID=your_store_id
railway variables set LEMONSQUEEZY_VARIANT_ID=your_variant_id
railway variables set LEMONSQUEEZY_WEBHOOK_SECRET=your_secret
```

## Quick Reference Commands

```bash
# Check if environment variables are set
cd movie2book
node -e "require('dotenv').config({ path: '.env.local' }); console.log('API Key:', process.env.LEMONSQUEEZY_API_KEY ? '✅ Set' : '❌ Missing'); console.log('Store ID:', process.env.LEMONSQUEEZY_STORE_ID ? '✅ Set' : '❌ Missing'); console.log('Variant ID:', process.env.LEMONSQUEEZY_VARIANT_ID ? '✅ Set' : '❌ Missing');"

# Test webhook locally with ngrok
ngrok http 3000

# View Supabase tables
# Go to Supabase Dashboard → Table Editor → user_subscriptions
```

## Troubleshooting

### Checkout not working?
- Verify all environment variables are set correctly
- Check browser console for errors
- Verify Store ID and Variant ID are correct (check Lemon Squeezy dashboard)

### Webhook not receiving events?
- Verify webhook URL is correct and accessible
- Check webhook secret matches
- View webhook logs in Lemon Squeezy Dashboard → Settings → Webhooks
- For local testing, make sure ngrok is running

### Subscription status not updating?
- Check webhook logs in Lemon Squeezy
- Verify `custom_data.user_id` is being passed in checkout
- Check Supabase logs for errors
- Verify RLS policies allow updates

## Next Steps

Once everything is set up:
1. ✅ Test a subscription purchase
2. ✅ Verify webhook updates subscription status
3. ✅ Test "Manage Subscription" link
4. ✅ Test cancellation flow
5. ✅ Deploy to production!

## Support

- Lemon Squeezy Docs: https://docs.lemonsqueezy.com
- API Reference: https://docs.lemonsqueezy.com/api
- Webhook Guide: https://docs.lemonsqueezy.com/help/webhooks
