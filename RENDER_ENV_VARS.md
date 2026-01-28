# Render Environment Variables Setup

## Important: Set These BEFORE First Build

Render needs these environment variables **during the build** to successfully compile Next.js.

### Required for Build:

1. Go to Render Dashboard → Your Service → **Environment** tab
2. Add these variables **BEFORE** deploying:

```
NEXT_PUBLIC_SUPABASE_URL=https://iubzlvifqarwuylbhyup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnpsdmlmcWFyd3V5bGJoeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg3NTgsImV4cCI6MjA4NTEwNDc1OH0.HhRAWPj0UW_ij2EBH625baOXJjG1ZoAUSUQuswxmdH8
```

### Also Add:

```
OPENAI_API_KEY=your_openai_key
PORT=3000
NODE_ENV=production
```

### After Deployment (Optional):

```
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID=your_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_secret
EXTERNAL_API_URL=https://your-app.onrender.com
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
