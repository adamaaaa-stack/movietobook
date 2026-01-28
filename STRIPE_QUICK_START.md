# Stripe Quick Start 🚀

## Quick Setup Steps

### 1. Stripe Account Setup
- Sign up: https://stripe.com
- Get API keys: **Developers** → **API keys**
  - Copy **Secret key** (`sk_test_...` or `sk_live_...`)
  - Copy **Publishable key** (`pk_...`) - not needed for backend

### 2. Create Product
- Go to **Products** → **Add product**
- Name: "Movie2Book Pro"
- Price: $10/month (recurring)
- Copy **Price ID** (`price_...`)

### 3. Set Up Webhook
- Go to **Developers** → **Webhooks** → **Add endpoint**
- URL: `https://your-app.onrender.com/api/webhook/stripe`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copy **Webhook Secret** (`whsec_...`)

### 4. Add to Render
Go to Render → Your Service → **Environment** tab:

```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PRICE_ID=price_your_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 5. Run Supabase Migration
- Supabase Dashboard → **SQL Editor**
- Run `supabase_migration_stripe.sql`

### 6. Test!
- Visit `/pricing` page
- Click "Subscribe"
- Use test card: `4242 4242 4242 4242`

## That's It! ✅

See `STRIPE_SETUP.md` for detailed guide.
