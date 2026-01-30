# Render Environment Variables Setup

## Important: Set These BEFORE First Build

Render needs these environment variables **during the build** to successfully compile Next.js.

### Required for Build:

1. Go to Render Dashboard → Your Service → **Environment** tab
2. Add these variables **BEFORE** deploying:

```
NEXT_PUBLIC_SUPABASE_URL=https://iubzlvifqarwuylbhyup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnpsdmlmcWFyd3V5bGJoeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg3NTgsImV4cCI6MjA4NTEwNDc1OH0.HhRAWPj0UW_ij2EBH625baOXJjPG1ZoAUSUQuswxmdH8
```

### Also Add:

```
OPENAI_API_KEY=your_openai_key
PORT=3000
NODE_ENV=production
```


### PayPal (10 books for $10 – no env vars)

**1. Get credentials from PayPal**

1. Go to [developer.paypal.com](https://developer.paypal.com) and sign in.
2. **Dashboard** → **Apps & Credentials** → your app (or create one). Copy **Client ID** and **Secret** (Sandbox for testing, Live for production).

**2. Edit config files (in `movie2book/`)**

- **`lib/paypal-config.client.ts`** — for the pricing/buy page button: set `PAYPAL_CLIENT_ID` to your Client ID. Optionally change `PAYPAL_HOSTED_BUTTON_ID` if you use a different hosted button.
- **`lib/paypal-config.server.ts`** — for the webhook and server API: set `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` (`sandbox` or `live`), and `PAYPAL_WEBHOOK_ID` (from step 3). Do not commit real secrets; use a secret file or private repo for production. The webhook also needs **SUPABASE_SERVICE_ROLE_KEY** (Supabase → Settings → API → service_role) in Render env so it can update `user_subscriptions`.

**3. Add the PayPal webhook**

1. In PayPal: **Dashboard** → **Apps & Credentials** → your app → **Webhooks** → **Add Webhook**.
2. **Webhook URL**: `https://movietobook.onrender.com/api/webhook/paypal` (use your real Render URL).
3. **Event types**: enable **Payment capture completed** (and **Payment sale completed** if listed). Save and copy the **Webhook ID** into `lib/paypal-config.server.ts` or Render env as `PAYPAL_WEBHOOK_ID`.

**4. Hosted button return URL**

In PayPal: **PayPal Buttons** → edit your $10 button → set **Return URL** to `https://movietobook.onrender.com/thanks?books=10`.

**PayPal flow (security)**  
Credits are granted **only** in the webhook (`/api/webhook/paypal`) after PayPal signature verification. We do not unlock on redirect or client-side. If `PAYPAL_WEBHOOK_ID` is not set, the webhook rejects and no credits are added.

### After Deployment (Optional):

```
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID=your_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_secret
EXTERNAL_API_URL=https://movietobook.onrender.com
```

## Why This Matters

Next.js needs `NEXT_PUBLIC_*` variables **during build time** to:
- Generate static pages correctly
- Avoid build errors with Supabase client
- Ensure proper code generation

**PayPal button not showing?** Edit `lib/paypal-config.client.ts` and set `PAYPAL_CLIENT_ID` to your PayPal Client ID.

**Paid but no credits?** Check in order:
1. **PayPal Dashboard** → Your app → **Webhooks** → open your webhook → **Webhook events**. See if PayPal is sending events and if any failed (wrong URL or 4xx/5xx).
2. **Render logs** — after a test payment, look for `[webhook/paypal] Received event:` (if you see nothing, PayPal isn’t calling your URL or it’s wrong). Then look for `Invalid signature` (wrong PAYPAL_WEBHOOK_ID or PAYPAL_MODE), or `No user found for payer email: X` (the PayPal payer email must match a Supabase user’s email — they must sign up with the same email they pay with).
3. **PAYPAL_MODE** — if the payment was **Live**, use Live app + Live webhook URL + Live Webhook ID. If **Sandbox**, use Sandbox app + Sandbox webhook + Sandbox Webhook ID. Don’t mix.
4. **SUPABASE_SERVICE_ROLE_KEY** — must be set on Render so the webhook can update `user_subscriptions`.

## Steps:

1. ✅ Create service in Render
2. ✅ **Add environment variables FIRST** (before deploying)
3. ✅ Then deploy
4. ✅ Build should succeed!

## Troubleshooting

- **CSS "preloaded but not used" warning:** Harmless browser/Next.js warning when prefetched routes load CSS not used on the current page; safe to ignore.
