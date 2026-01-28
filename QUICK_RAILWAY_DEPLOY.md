# Quick Railway Deployment Steps

Your deployment has started! Follow these steps to complete setup:

## Step 1: Link Service (Required)

Run this command and select the service that was just created:

```bash
cd /Users/oogy/Documents/movietobook
railway service
```

Select the service from the list (it should be the one that was just created by `railway up`).

## Step 2: Set Environment Variables

After linking the service, run:

```bash
./set-railway-vars.sh
```

Or set them manually:

```bash
# Supabase
railway variables set NEXT_PUBLIC_SUPABASE_URL="https://iubzlvifqarwuylbhyup.supabase.co"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnpsdmlmcWFyd3V5bGJoeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg7NTgsImV4cCI6MjA4NTEwNDc1OH0.HhRAWPj0UW_ij2EBH625baOXJjG1ZoAUSUQuswxmdH8"

# OpenAI (replace with your actual key)
railway variables set OPENAI_API_KEY="your_openai_api_key_here"

# App Config
railway variables set PORT=3000
railway variables set NODE_ENV=production

# Lemon Squeezy (update these with real values later)
railway variables set LEMONSQUEEZY_API_KEY="your_api_key_here"
railway variables set LEMONSQUEEZY_STORE_ID="your_store_id"
railway variables set LEMONSQUEEZY_VARIANT_ID="your_variant_id"
railway variables set LEMONSQUEEZY_WEBHOOK_SECRET="your_webhook_secret"
```

## Step 3: Check Deployment Status

```bash
# View logs
railway logs

# Check status
railway status

# Get your domain
railway domain
```

## Step 4: Update EXTERNAL_API_URL

After deployment completes and you have your domain:

```bash
railway variables set EXTERNAL_API_URL="https://your-app-name.up.railway.app"
```

Replace `your-app-name` with your actual Railway domain.

## Step 5: View Deployment

Check your deployment logs:
```bash
railway logs --build
```

Or open Railway dashboard:
```bash
railway open
```

## Troubleshooting

### If variables don't set:
Make sure you've linked the service first:
```bash
railway service
```

### If deployment fails:
Check build logs:
```bash
railway logs --build
```

### To redeploy:
```bash
railway up
```

## Next Steps After Deployment

1. ✅ Get your Railway domain: `railway domain`
2. ✅ Update EXTERNAL_API_URL with your domain
3. ✅ Update Lemon Squeezy webhook URL to: `https://your-domain.up.railway.app/api/webhook/lemonsqueezy`
4. ✅ Test your app at the Railway domain
5. ✅ Update Lemon Squeezy variables with real values when ready
