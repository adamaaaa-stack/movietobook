# PayPal Quick Start 🚀

## Quick Setup Steps

### 1. PayPal Account Setup
- Sign up: https://www.paypal.com/business
- Developer Dashboard: https://developer.paypal.com
- Get credentials: **Dashboard** → **My Apps & Credentials**
  - Copy **Client ID** (your API key)
  - Copy **Secret** (your secret)

### 2. Create Webhook
- Go to **My Apps & Credentials** → Your App → **Webhooks**
- URL: `https://your-app.onrender.com/api/webhook/paypal`
- Events:
  - `BILLING.SUBSCRIPTION.CREATED`
  - `BILLING.SUBSCRIPTION.ACTIVATED`
  - `BILLING.SUBSCRIPTION.CANCELLED`
  - `BILLING.SUBSCRIPTION.EXPIRED`
  - `PAYMENT.SALE.COMPLETED`
- Copy **Webhook ID**

### 3. Add to Render
Go to Render → Your Service → **Environment** tab:

```
PAYPAL_CLIENT_ID=AYWKg5s7NxiWkaEYiVP50jSFtybCx9lwX-ncRlk0rVFZaC0YZZoV4wA1qVIlhRGQhIJji9SZSxsmzbLN
PAYPAL_CLIENT_SECRET=EOGet9IQdNr7tuWYmqrZQ5OVI_6sjz4Pzog5jUYxgdufwLY-esdJLK17Uy5ttxPlL1ZQuWnEkCVFLPl_
PAYPAL_MODE=sandbox (or 'live' for production)
PAYPAL_WEBHOOK_ID=your_webhook_id
```

### 4. Run Supabase Migration
- Supabase Dashboard → **SQL Editor**
- Run `supabase_migration_paypal.sql`

### 5. Test!
- Visit `/pricing` page
- Click "Subscribe"
- Complete PayPal checkout

## That's It! ✅

See `PAYPAL_SETUP.md` for detailed guide.
