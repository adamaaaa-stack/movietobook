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


### Gumroad (license key verification)

Customers buy on Gumroad → get a license key via email → paste it on `/subscribe` to access the dashboard.

**Store URL (for “Buy on Gumroad” link):** https://morrison844.gumroad.com/l/zmytfj

**1. Get your Product ID (required for verify API)**

The link permalink (`zmytfj`) is **not** the Product ID. For products created after Jan 2023, Gumroad’s verify API needs the **Product ID** (a longer string, e.g. `Abc12XyZ-...`):

- Gumroad → [Products](https://gumroad.com/products) → **Movie2Book 10 Credits** → **Edit**
- Product ID is in the edit URL (`.../products/XXXXXXXX/edit`) or under **Advanced** in the product settings.

**2. Add environment variables**

In Render (and locally in `movie2book/.env.local`):

```
NEXT_PUBLIC_GUMROAD_PRODUCT_ID=Pgcwxd-S8GCcm57UgpVM0A==
NEXT_PUBLIC_GUMROAD_STORE_URL=https://morrison844.gumroad.com/l/zmytfj
GUMROAD_PRODUCT_ID=Pgcwxd-S8GCcm57UgpVM0A==
NEXTAUTH_SECRET=your-secret-here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Required for Gumroad credits:** `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Dashboard → Project Settings → API → `service_role` secret) is used to create/link Supabase users when a license is verified and to grant 10 credits. Never expose this key to the client.

Use the **Product ID** from step 1 for both `GUMROAD_PRODUCT_ID` and `NEXT_PUBLIC_GUMROAD_PRODUCT_ID` (Movie2Book 10 Credits: `Pgcwxd-S8GCcm57UgpVM0A==`). Keep the store URL as above.

Generate a secret: `openssl rand -base64 32`

**3. Gumroad product**

In Gumroad → your product (https://morrison844.gumroad.com/l/zmytfj) → **Content** tab → enable **License keys** so customers receive a key by email after purchase.

**4. Optional: redirect after purchase**

If you want redirect-after-purchase (instead of paste-only), set **Redirect on purchase** in Gumroad to `https://yourdomain.com/api/gumroad/callback`. Otherwise customers use the key from email on `/subscribe`.

## Why This Matters

Next.js needs `NEXT_PUBLIC_*` variables **during build time** to:
- Generate static pages correctly
- Avoid build errors with Supabase client
- Ensure proper code generation

**Gumroad: "That license does not exist for the provided product"** — Use the **Product ID** from the product edit page (not the permalink `zmytfj`). See “Get your Product ID” above. Enable license keys in Gumroad → product → Content.

**Cookie not setting** — Ensure `NEXTAUTH_SECRET` is set and the same in all environments.

## Steps:

1. ✅ Create service in Render
2. ✅ **Add environment variables FIRST** (before deploying)
3. ✅ Then deploy
4. ✅ Build should succeed!

## Troubleshooting

- **CSS "preloaded but not used" warning:** Harmless browser/Next.js warning when prefetched routes load CSS not used on the current page; safe to ignore.
