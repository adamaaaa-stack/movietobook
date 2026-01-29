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


### PayPal (10 books for $10 – hosted button + webhook)

**1. Get Client ID and Client Secret**

1. Go to [developer.paypal.com](https://developer.paypal.com) and sign in.
2. Open **Dashboard** → **Apps & Credentials**.
3. Under **REST API apps**, use your app (or create one).  
   - **Sandbox** tab: use for testing.  
   - **Live** tab: use for production.
4. Click the app → copy **Client ID** and **Secret** (click “Show” to reveal Secret).

**2. Add environment variables (Render and local)**

In **Render**: Your Service → **Environment** tab.  
Locally: `movie2book/.env.local`.

```
# Same value for both; client ID is safe in the browser for the hosted button
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id

# sandbox for testing, live for production
PAYPAL_MODE=sandbox

# From step 3 below
PAYPAL_WEBHOOK_ID=your_webhook_id

# Required for webhook to update user_subscriptions
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Get **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard → **Settings** → **API** → copy **service_role** (secret).

**3. Add the PayPal webhook (so 10 credits are granted when someone pays)**

1. Go to [developer.paypal.com](https://developer.paypal.com) → **Dashboard** → **Apps & Credentials**.
2. Under **REST API apps**, open your app.
3. Scroll to **Webhooks** and click **Add Webhook** (or **Webhooks** in the left menu).
4. **Webhook URL**:  
   `https://movietobook.onrender.com/api/webhook/paypal`  
   (replace with your real Render URL if different).
5. **Event types**: enable **Payment capture completed** (or **Payments** → **Payment capture completed**).
6. Save. Copy the **Webhook ID** and set it as `PAYPAL_WEBHOOK_ID` in Render (and in `.env.local` if you test locally with a tunnel).

**4. Return URL for the hosted button**

In PayPal: **Dashboard** → **PayPal Buttons** (or where you created the $10 button) → edit the button → set **Return URL** to:  
`https://movietobook.onrender.com/thanks?books=10`  
so buyers land on your thanks page after payment.

---

Optional: `NEXT_PUBLIC_PAYPAL_HOSTED_BUTTON_10` — override hosted button ID (default: `7DU2SEA66KR3U`).

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

## Steps:

1. ✅ Create service in Render
2. ✅ **Add environment variables FIRST** (before deploying)
3. ✅ Then deploy
4. ✅ Build should succeed!

## Troubleshooting

- **CSS "preloaded but not used" warning:** Harmless browser/Next.js warning when prefetched routes load CSS not used on the current page; safe to ignore.
