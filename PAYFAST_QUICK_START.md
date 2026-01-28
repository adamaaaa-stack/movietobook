# PayFast Quick Start 🚀

## Quick Setup Steps

### 1. PayFast Account Setup
- Sign up: https://www.payfast.co.za
- Get credentials: **Settings** → **Integration**
  - Copy **Merchant ID**
  - Copy **Merchant Key**
  - Copy **Passphrase** (if set)

### 2. Create Subscription
- Go to **Settings** → **Subscriptions**
- Create: "Movie2Book Pro" - R10/month (or equivalent)
- Frequency: Monthly
- Cycles: 0 (indefinite)

### 3. Set Up ITN
- Go to **Settings** → **ITN**
- URL: `https://your-app.onrender.com/api/webhook/payfast`
- Enable ITN notifications

### 4. Add to Render
Go to Render → Your Service → **Environment** tab:

```
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase (if set)
PAYFAST_MODE=sandbox (or 'live' for production)
```

### 5. Run Supabase Migration
- Supabase Dashboard → **SQL Editor**
- Run `supabase_migration_payfast.sql`

### 6. Test!
- Visit `/pricing` page
- Click "Subscribe"
- Complete PayFast checkout

## Important Notes

- **Currency**: PayFast uses ZAR (South African Rand) by default
- **No SDK needed**: PayFast uses form-based integration
- **ITN required**: Must return 'OK' response to PayFast
- **Customer portal**: Users manage through PayFast account

## That's It! ✅

See `PAYFAST_SETUP.md` for detailed guide.
