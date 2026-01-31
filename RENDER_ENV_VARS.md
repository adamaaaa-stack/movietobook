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

**1. Add environment variables**

In Render (and locally in `movie2book/.env.local`):

```
NEXT_PUBLIC_GUMROAD_PRODUCT_ID=zmytfj
NEXT_PUBLIC_GUMROAD_STORE_URL=https://morrison844.gumroad.com/l/zmytfj
GUMROAD_PRODUCT_ID=zmytfj
NEXTAUTH_SECRET=your-secret-here
```

Generate a secret: `openssl rand -base64 32`

**2. Gumroad product**

In Gumroad → your product (e.g. https://morrison844.gumroad.com/l/zmytfj) → **Content** tab → enable **License keys** so customers receive a key by email after purchase.

**3. Optional: redirect after purchase**

If you want redirect-after-purchase (instead of paste-only), set **Redirect on purchase** in Gumroad to `https://yourdomain.com/api/gumroad/callback`. Otherwise customers use the key from email on `/subscribe`.

## Why This Matters

Next.js needs `NEXT_PUBLIC_*` variables **during build time** to:
- Generate static pages correctly
- Avoid build errors with Supabase client
- Ensure proper code generation

**Gumroad: "Invalid license key"** — Ensure `GUMROAD_PRODUCT_ID` matches your Gumroad product (zmytfj). Enable license keys in Gumroad → product → Content.

**Cookie not setting** — Ensure `NEXTAUTH_SECRET` is set and the same in all environments.

## Steps:

1. ✅ Create service in Render
2. ✅ **Add environment variables FIRST** (before deploying)
3. ✅ Then deploy
4. ✅ Build should succeed!

## Troubleshooting

- **CSS "preloaded but not used" warning:** Harmless browser/Next.js warning when prefetched routes load CSS not used on the current page; safe to ignore.
