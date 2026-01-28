# Lemon Squeezy Setup for Render 🍋

Complete guide to set up Lemon Squeezy payments with your Render deployment.

## Step 1: Create Lemon Squeezy Account

1. Go to **https://lemonsqueezy.com**
2. Sign up for an account
3. Verify your email

## Step 2: Get Your API Key

1. Log into Lemon Squeezy Dashboard
2. Go to **Settings** → **API**
3. Click **"Create API Key"**
4. Give it a name (e.g., "Movie2Book Production")
5. **Copy the API key** (you'll only see it once!)

## Step 3: Create a Store

1. In Lemon Squeezy Dashboard, go to **Stores**
2. If you don't have a store, click **"Create Store"**
3. Fill in:
   - **Store name**: "Movie2Book Store"
   - **Store URL**: your domain (or leave default)
4. **Copy your Store ID** (visible in the URL or store settings)

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
6. **Copy the Variant ID** (from URL or variant page)

## Step 5: Set Up Webhook

### For Render Deployment:

1. Go to **Settings** → **Webhooks**
2. Click **"Create Webhook"**
3. Set endpoint URL:
   ```
   https://your-app-name.onrender.com/api/webhook/lemonsqueezy
   ```
   (Replace `your-app-name` with your actual Render domain - you'll get this after deployment)
4. Select these events:
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `subscription_payment_success`
   - ✅ `subscription_cancelled`
   - ✅ `subscription_expired`
5. Click **"Create Webhook"**
6. **Copy the Webhook Signing Secret**

## Step 6: Add Environment Variables to Render

After your Render deployment is live:

1. Go to your Render dashboard
2. Click on your service (`movie2book`)
3. Go to **"Environment"** tab
4. Add these variables:

```
LEMONSQUEEZY_API_KEY=your_api_key_from_step_2
LEMONSQUEEZY_STORE_ID=your_store_id_from_step_3
LEMONSQUEEZY_VARIANT_ID=your_variant_id_from_step_4
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_from_step_5
```

5. Click **"Save Changes"**
6. Render will auto-redeploy with new variables

## Step 7: Update Webhook URL

After you have your Render URL:

1. Go to Lemon Squeezy Dashboard → **Settings** → **Webhooks**
2. Click on your webhook
3. Update the URL to: `https://your-actual-render-url.onrender.com/api/webhook/lemonsqueezy`
4. Save

## Step 8: Test the Integration

### Test Checkout Flow:

1. Visit your Render app: `https://your-app.onrender.com`
2. Sign up or log in
3. Go to `/pricing` page
4. Click **"Subscribe"**
5. You should be redirected to Lemon Squeezy checkout

### Test Webhook:

1. Complete a test purchase in Lemon Squeezy test mode
2. Check Render logs: Your service → "Logs" tab
3. Check Supabase `user_subscriptions` table - status should update to `active`

## Quick Reference

### Environment Variables Needed in Render:

```
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID=your_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

### Webhook URL Format:

```
https://your-app-name.onrender.com/api/webhook/lemonsqueezy
```

### Customer Portal Link:

Users can manage subscriptions at:
```
https://app.lemonsqueezy.com/my-account/subscriptions?customer={customer_id}
```

## Troubleshooting

### Checkout Not Working?
- ✅ Verify all environment variables are set in Render
- ✅ Check Render logs for errors
- ✅ Verify Store ID and Variant ID are correct
- ✅ Make sure you're using the correct API key (test vs live)

### Webhook Not Receiving Events?
- ✅ Verify webhook URL is correct and accessible
- ✅ Check webhook secret matches in Render env vars
- ✅ View webhook logs in Lemon Squeezy Dashboard → Settings → Webhooks
- ✅ Check Render logs for webhook processing errors

### Subscription Status Not Updating?
- ✅ Check webhook logs in Lemon Squeezy
- ✅ Verify `custom_data.user_id` is being passed in checkout
- ✅ Check Render logs for errors
- ✅ Verify Supabase RLS policies allow updates

## Flow Summary

1. **User clicks "Subscribe"** → Calls `/api/checkout`
2. **Checkout API** → Creates Lemon Squeezy checkout session
3. **User completes payment** → Redirected back to `/dashboard?success=true`
4. **Lemon Squeezy sends webhook** → `/api/webhook/lemonsqueezy`
5. **Webhook updates Supabase** → Sets `status: 'active'`
6. **User has unlimited conversions** ✅

## Next Steps

1. ✅ Set up Lemon Squeezy account
2. ✅ Create store, product, variant
3. ✅ Get API key and IDs
4. ✅ Deploy to Render first
5. ✅ Add environment variables to Render
6. ✅ Set up webhook with Render URL
7. ✅ Test checkout flow
8. ✅ Test webhook delivery

## Support

- Lemon Squeezy Docs: https://docs.lemonsqueezy.com
- API Reference: https://docs.lemonsqueezy.com/api
- Webhook Guide: https://docs.lemonsqueezy.com/help/webhooks
- Render Support: support@render.com

Good luck! 🍋💰
