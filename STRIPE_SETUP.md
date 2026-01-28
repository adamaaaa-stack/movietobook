# Stripe Payment Integration Setup 💳

Complete guide to set up Stripe payments for Movie2Book.

## Step 1: Create Stripe Account

1. Go to **https://stripe.com**
2. Sign up for an account
3. Verify your email
4. Complete account setup (business details)

## Step 2: Get Your API Keys

1. Log into Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_`)
   - Use **Test mode** key for development
   - Use **Live mode** key for production
4. Copy your **Publishable key** (starts with `pk_`) - not needed for backend

## Step 3: Create Product & Price

1. Go to **Products** → **"Add product"**
2. Fill in:
   - **Name**: "Movie2Book Pro"
   - **Description**: "Unlimited video to book conversions"
   - **Pricing model**: Recurring
   - **Price**: $10.00 USD
   - **Billing period**: Monthly
3. Click **"Save product"**
4. **Copy the Price ID** (starts with `price_`)

## Step 4: Set Up Webhook

### For Render Deployment:

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Set endpoint URL:
   ```
   https://your-app-name.onrender.com/api/webhook/stripe
   ```
   (Replace `your-app-name` with your actual Render domain - you'll get this after deployment)
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
5. Click **"Add endpoint"**
6. **Copy the Webhook Signing Secret** (starts with `whsec_`)

## Step 5: Add Environment Variables to Render

After your Render deployment is live:

1. Go to your Render dashboard
2. Click on your service (`movie2book`)
3. Go to **"Environment"** tab
4. Add these variables:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PRICE_ID=price_your_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**For Production:**
- Use `sk_live_...` for `STRIPE_SECRET_KEY`
- Use live mode webhook secret

5. Click **"Save Changes"**
6. Render will auto-redeploy with new variables

## Step 6: Update Webhook URL

After you have your Render URL:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Update the URL to: `https://your-actual-render-url.onrender.com/api/webhook/stripe`
4. Save

## Step 7: Run Supabase Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Open `supabase_migration_stripe.sql` from your project
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **"Run"**

This will:
- Remove Lemon Squeezy columns
- Add Stripe columns
- Update RLS policies

## Step 8: Test the Integration

### Test Checkout Flow:

1. Visit your Render app: `https://your-app.onrender.com`
2. Sign up or log in
3. Go to `/pricing` page
4. Click **"Subscribe"**
5. You should be redirected to Stripe checkout
6. Use Stripe test card: `4242 4242 4242 4242`
7. Complete test purchase

### Test Webhook:

1. Complete a test purchase
2. Check Render logs: Your service → "Logs" tab
3. Check Supabase `user_subscriptions` table - status should update to `active`

## Quick Reference

### Environment Variables Needed in Render:

```
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Webhook URL Format:

```
https://your-app-name.onrender.com/api/webhook/stripe
```

### Stripe Test Cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## Troubleshooting

### Checkout Not Working?
- ✅ Verify all environment variables are set in Render
- ✅ Check Render logs for errors
- ✅ Verify Price ID is correct
- ✅ Make sure you're using the correct API key (test vs live)

### Webhook Not Receiving Events?
- ✅ Verify webhook URL is correct and accessible
- ✅ Check webhook secret matches in Render env vars
- ✅ View webhook logs in Stripe Dashboard → Developers → Webhooks
- ✅ Check Render logs for webhook processing errors

### Subscription Status Not Updating?
- ✅ Check webhook logs in Stripe Dashboard
- ✅ Verify `client_reference_id` contains user_id
- ✅ Check Render logs for errors
- ✅ Verify Supabase RLS policies allow updates

## Flow Summary

1. **User clicks "Subscribe"** → Calls `/api/checkout`
2. **Checkout API** → Creates Stripe checkout session
3. **User completes payment** → Redirected back to `/dashboard?success=true`
4. **Stripe sends webhook** → `/api/webhook/stripe`
5. **Webhook updates Supabase** → Sets `status: 'active'`
6. **User has unlimited conversions** ✅

## Next Steps

1. ✅ Set up Stripe account
2. ✅ Create product and price
3. ✅ Get API keys and Price ID
4. ✅ Deploy to Render first
5. ✅ Add environment variables to Render
6. ✅ Set up webhook with Render URL
7. ✅ Run Supabase migration
8. ✅ Test checkout flow
9. ✅ Test webhook delivery

## Support

- Stripe Docs: https://stripe.com/docs
- API Reference: https://stripe.com/docs/api
- Webhook Guide: https://stripe.com/docs/webhooks
- Render Support: support@render.com

Good luck! 💳💰
