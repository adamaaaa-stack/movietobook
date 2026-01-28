# PayFast Payment Integration Setup 💳

Complete guide to set up PayFast payments for Movie2Book.

## Step 1: Create PayFast Account

1. Go to **https://www.payfast.co.za**
2. Sign up for a merchant account
3. Complete business verification
4. Verify your email

## Step 2: Get Your Merchant Credentials

1. Log into PayFast Dashboard
2. Go to **Settings** → **Integration**
3. Copy your credentials:
   - **Merchant ID**
   - **Merchant Key**
   - **Passphrase** (if you set one)

## Step 3: Create Subscription Product

1. Go to **Settings** → **Subscriptions**
2. Create a new subscription:
   - **Name**: "Movie2Book Pro"
   - **Amount**: R10.00 (or equivalent in your currency)
   - **Frequency**: Monthly
   - **Cycles**: 0 (indefinite)

**Note:** PayFast uses South African Rand (ZAR) by default. You may need to configure currency conversion.

## Step 4: Set Up ITN (Instant Transaction Notification)

### For Render Deployment:

1. Go to **Settings** → **ITN**
2. Set ITN URL:
   ```
   https://your-app-name.onrender.com/api/webhook/payfast
   ```
   (Replace `your-app-name` with your actual Render domain)
3. Enable ITN notifications
4. Save settings

## Step 5: Add Environment Variables to Render

After your Render deployment is live:

1. Go to your Render dashboard
2. Click on your service (`movie2book`)
3. Go to **"Environment"** tab
4. Add these variables:

```
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase (if set)
PAYFAST_MODE=sandbox (or 'live' for production)
```

**For Production:**
- Use `PAYFAST_MODE=live`
- Use live merchant credentials

5. Click **"Save Changes"**
6. Render will auto-redeploy with new variables

## Step 6: Update ITN URL

After you have your Render URL:

1. Go to PayFast Dashboard → **Settings** → **ITN**
2. Update ITN URL to: `https://your-actual-render-url.onrender.com/api/webhook/payfast`
3. Save

## Step 7: Run Supabase Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Open `supabase_migration_payfast.sql` from your project
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **"Run"**

This will:
- Remove Stripe columns
- Add PayFast columns
- Update RLS policies

## Step 8: Test the Integration

### Test Checkout Flow:

1. Visit your Render app: `https://your-app.onrender.com`
2. Sign up or log in
3. Go to `/pricing` page
4. Click **"Subscribe"**
5. You should be redirected to PayFast checkout
6. Use PayFast test credentials:
   - Card: Use PayFast test card numbers
   - Complete test purchase

### Test ITN:

1. Complete a test purchase
2. Check Render logs: Your service → "Logs" tab
3. Check Supabase `user_subscriptions` table - status should update to `active`

## Quick Reference

### Environment Variables Needed in Render:

```
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase (optional)
PAYFAST_MODE=sandbox or live
```

### ITN URL Format:

```
https://your-app-name.onrender.com/api/webhook/payfast
```

### PayFast URLs:

- **Sandbox**: `https://sandbox.payfast.co.za`
- **Live**: `https://www.payfast.co.za`

## Important Notes

### Currency
- PayFast primarily uses South African Rand (ZAR)
- You may need to handle currency conversion
- Check PayFast documentation for multi-currency support

### Subscription Management
- PayFast doesn't have a direct customer portal like Stripe
- Users manage subscriptions through their PayFast account
- Or provide support contact for subscription changes

### ITN Verification
- PayFast requires ITN verification
- The webhook handler validates signatures
- Must return 'OK' response to PayFast

## Troubleshooting

### Checkout Not Working?
- ✅ Verify all environment variables are set in Render
- ✅ Check Render logs for errors
- ✅ Verify Merchant ID and Key are correct
- ✅ Make sure you're using correct mode (sandbox vs live)

### ITN Not Receiving Events?
- ✅ Verify ITN URL is correct and accessible
- ✅ Check ITN is enabled in PayFast dashboard
- ✅ View ITN logs in PayFast Dashboard → Settings → ITN
- ✅ Check Render logs for ITN processing errors
- ✅ Ensure webhook returns 'OK' response

### Subscription Status Not Updating?
- ✅ Check ITN logs in PayFast Dashboard
- ✅ Verify `m_payment_id` contains user_id
- ✅ Check Render logs for errors
- ✅ Verify Supabase RLS policies allow updates

## Flow Summary

1. **User clicks "Subscribe"** → Calls `/api/checkout`
2. **Checkout API** → Generates PayFast form data and signature
3. **Frontend submits form** → Redirects to PayFast hosted page
4. **User completes payment** → PayFast processes payment
5. **PayFast sends ITN** → `/api/webhook/payfast`
6. **Webhook validates and updates** → Sets `status: 'active'`
7. **User redirected back** → `/dashboard?success=true`
8. **User has unlimited conversions** ✅

## Next Steps

1. ✅ Set up PayFast account
2. ✅ Get merchant credentials
3. ✅ Create subscription product
4. ✅ Deploy to Render first
5. ✅ Add environment variables to Render
6. ✅ Set up ITN with Render URL
7. ✅ Run Supabase migration
8. ✅ Test checkout flow
9. ✅ Test ITN delivery

## Support

- PayFast Docs: https://www.payfast.co.za/s/std/developer-resources
- API Reference: https://www.payfast.co.za/s/std/api
- ITN Guide: https://www.payfast.co.za/s/std/itn-integration
- Render Support: support@render.com

Good luck! 💳🇿🇦
