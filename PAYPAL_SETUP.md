# PayPal Payment Integration Setup 💳

Complete guide to set up PayPal payments for Movie2Book.

## Step 1: Create PayPal Business Account

1. Go to **https://www.paypal.com/business**
2. Sign up for a business account
3. Complete business verification
4. Verify your email

## Step 2: Get Your API Credentials

1. Log into PayPal Developer Dashboard: **https://developer.paypal.com**
2. Go to **Dashboard** → **My Apps & Credentials**
3. Create a new app or use existing:
   - **App Name**: "Movie2Book"
   - **Merchant**: Select your business account
4. Copy your credentials:
   - **Client ID** (starts with your API key)
   - **Secret** (your secret key)

**Note:** Use **Sandbox** credentials for testing, **Live** for production.

## Step 3: Create Product (Optional but Recommended)

1. Go to PayPal Dashboard → **Products**
2. Click **"Create Product"**
3. Fill in:
   - **Name**: "Movie2Book Pro"
   - **Description**: "Unlimited video to book conversions"
   - **Type**: Service
4. Copy the **Product ID** (you'll use this in the code)

## Step 4: Set Up Webhook

### For Render Deployment:

1. Go to PayPal Developer Dashboard → **My Apps & Credentials**
2. Click on your app
3. Scroll to **Webhooks** section
4. Click **"Add Webhook"**
5. Set webhook URL:
   ```
   https://your-app-name.onrender.com/api/webhook/paypal
   ```
   (Replace `your-app-name` with your actual Render domain)
6. Select events:
   - ✅ `BILLING.SUBSCRIPTION.CREATED`
   - ✅ `BILLING.SUBSCRIPTION.ACTIVATED`
   - ✅ `BILLING.SUBSCRIPTION.CANCELLED`
   - ✅ `BILLING.SUBSCRIPTION.EXPIRED`
   - ✅ `BILLING.SUBSCRIPTION.SUSPENDED`
   - ✅ `PAYMENT.SALE.COMPLETED`
7. Click **"Save"**
8. **Copy the Webhook ID** (you'll need this)

## Step 5: Add Environment Variables to Render

After your Render deployment is live:

1. Go to your Render dashboard
2. Click on your service (`movie2book`)
3. Go to **"Environment"** tab
4. Add these variables:

```
PAYPAL_CLIENT_ID=AYWKg5s7NxiWkaEYiVP50jSFtybCx9lwX-ncRlk0rVFZaC0YZZoV4wA1qVIlhRGQhIJji9SZSxsmzbLN
PAYPAL_CLIENT_SECRET=EOGet9IQdNr7tuWYmqrZQ5OVI_6sjz4Pzog5jUYxgdufwLY-esdJLK17Uy5ttxPlL1ZQuWnEkCVFLPl_
PAYPAL_MODE=sandbox (or 'live' for production)
PAYPAL_WEBHOOK_ID=your_webhook_id_from_step_4
```

**For Production:**
- Use `PAYPAL_MODE=live`
- Use live credentials from PayPal Dashboard

5. Click **"Save Changes"**
6. Render will auto-redeploy with new variables

## Step 6: Update Webhook URL

After you have your Render URL:

1. Go to PayPal Developer Dashboard → **My Apps & Credentials**
2. Click on your app → **Webhooks**
3. Click on your webhook
4. Update URL to: `https://your-actual-render-url.onrender.com/api/webhook/paypal`
5. Save

## Step 7: Run Supabase Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Open `supabase_migration_paypal.sql` from your project
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **"Run"**

This will:
- Remove PayFast columns
- Add PayPal columns
- Update RLS policies

## Step 8: Test the Integration

### Test Checkout Flow:

1. Visit your Render app: `https://your-app.onrender.com`
2. Sign up or log in
3. Go to `/pricing` page
4. Click **"Subscribe"**
5. You should be redirected to PayPal checkout
6. Use PayPal Sandbox test account or real PayPal account
7. Complete test purchase

### Test Webhook:

1. Complete a test purchase
2. Check Render logs: Your service → "Logs" tab
3. Check Supabase `user_subscriptions` table - status should update to `active`

## Quick Reference

### Environment Variables Needed in Render:

```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox or live
PAYPAL_WEBHOOK_ID=your_webhook_id
```

### Webhook URL Format:

```
https://your-app-name.onrender.com/api/webhook/paypal
```

### PayPal URLs:

- **Sandbox API**: `https://api-m.sandbox.paypal.com`
- **Live API**: `https://api-m.paypal.com`

## Important Notes

### Subscription Plans
- PayPal creates subscription plans dynamically
- Each checkout creates a new plan (you may want to cache plan IDs)
- Plans are reusable once created

### Webhook Verification
- PayPal requires webhook signature verification
- The webhook handler validates signatures automatically
- Must return 200 OK response

### Subscription Management
- Users can manage subscriptions through PayPal account
- Or use the cancel link from subscription details

## Troubleshooting

### Checkout Not Working?
- ✅ Verify all environment variables are set in Render
- ✅ Check Render logs for errors
- ✅ Verify Client ID and Secret are correct
- ✅ Make sure you're using correct mode (sandbox vs live)
- ✅ Check PayPal Developer Dashboard for API errors

### Webhook Not Receiving Events?
- ✅ Verify webhook URL is correct and accessible
- ✅ Check webhook is enabled in PayPal Dashboard
- ✅ View webhook logs in PayPal Developer Dashboard
- ✅ Check Render logs for webhook processing errors
- ✅ Verify webhook ID matches in environment variables

### Subscription Status Not Updating?
- ✅ Check webhook logs in PayPal Dashboard
- ✅ Verify `custom_id` contains user_id
- ✅ Check Render logs for errors
- ✅ Verify Supabase RLS policies allow updates

## Flow Summary

1. **User clicks "Subscribe"** → Calls `/api/checkout`
2. **Checkout API** → Creates PayPal subscription plan and subscription
3. **User redirected** → PayPal approval page
4. **User approves** → PayPal processes payment
5. **PayPal sends webhook** → `/api/webhook/paypal`
6. **Webhook validates and updates** → Sets `status: 'active'`
7. **User redirected back** → `/dashboard?success=true`
8. **User has unlimited conversions** ✅

## Next Steps

1. ✅ Set up PayPal business account
2. ✅ Get API credentials from Developer Dashboard
3. ✅ Create webhook and get Webhook ID
4. ✅ Deploy to Render first
5. ✅ Add environment variables to Render
6. ✅ Update webhook URL with Render domain
7. ✅ Run Supabase migration
8. ✅ Test checkout flow
9. ✅ Test webhook delivery

## Support

- PayPal Docs: https://developer.paypal.com/docs
- Subscriptions API: https://developer.paypal.com/docs/subscriptions
- Webhooks Guide: https://developer.paypal.com/docs/api-basics/notifications/webhooks
- Render Support: support@render.com

Good luck! 💳💰
