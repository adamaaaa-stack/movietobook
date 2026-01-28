# Render Troubleshooting Guide 🔧

## Common Errors and Fixes

### 1. Checkout Error (500)

**Error:** `Failed to create checkout session`

**Causes:**
- PayPal credentials not set in Render
- PayPal API authentication failed
- Product/plan creation failed

**Fix:**
1. Check Render environment variables:
   ```
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=sandbox
   ```
2. Verify credentials in PayPal Developer Dashboard
3. Check Render logs for specific PayPal API errors

### 2. Upload Error (403) - Subscription Required

**Error:** `Subscription required`

**This is correct behavior if:**
- User has used their free conversion
- User doesn't have active subscription

**To test free conversion:**
1. Make sure user has `status: 'free'` and `free_conversions_used: false` in Supabase
2. Or create a new user account

**To allow uploads:**
1. Subscribe via `/pricing` page
2. Or manually update Supabase:
   ```sql
   UPDATE user_subscriptions 
   SET status = 'active' 
   WHERE user_id = 'your_user_id';
   ```

### 3. PayPal Product Creation Error

**Error:** PayPal product creation fails

**Fix:**
1. Create product manually in PayPal Dashboard:
   - Go to PayPal Dashboard → Products
   - Create "Movie2Book Pro"
   - Copy Product ID
   - Add to Render: `PAYPAL_PRODUCT_ID=your_product_id`
2. Or let the code use default `PROD_MOVIE2BOOK`

### 4. Webhook Not Working

**Symptoms:**
- Payment completes but subscription status doesn't update
- No webhook events in logs

**Fix:**
1. Verify webhook URL in PayPal Dashboard
2. Check `PAYPAL_WEBHOOK_ID` is set in Render
3. Check Render logs for webhook processing errors
4. Verify webhook signature validation

### 5. CSS Preload Warning

**Warning:** `The resource ... was preloaded using link preload but not used`

**This is harmless** - Next.js optimization warning. Can be ignored.

### 6. 404 Errors

**Error:** `Failed to load resource: 404`

**Check:**
- Is the route correct? (`/api/checkout`, `/api/upload-railway`)
- Is the service running?
- Check Render logs for routing errors

## Quick Debugging Steps

### Check Render Logs:
1. Go to Render Dashboard → Your Service
2. Click **"Logs"** tab
3. Look for errors related to:
   - PayPal API calls
   - Supabase queries
   - Missing environment variables

### Check Environment Variables:
```bash
# In Render Dashboard → Environment tab
# Verify these are set:
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Test PayPal Credentials:
```bash
# Test PayPal API access
curl -X POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -H "Accept-Language: en_US" \
  -u "CLIENT_ID:SECRET" \
  -d "grant_type=client_credentials"
```

### Check Supabase:
1. Go to Supabase Dashboard → Table Editor
2. Check `user_subscriptions` table
3. Verify user has correct status

## Still Having Issues?

1. Check Render logs for specific error messages
2. Verify all environment variables are set
3. Test PayPal credentials manually
4. Check Supabase RLS policies
5. Verify webhook is configured correctly
