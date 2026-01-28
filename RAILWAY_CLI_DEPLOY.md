# Railway CLI Deployment Guide 🚀

Complete guide to deploy Movie2Book to Railway using CLI.

## Step 1: Install Railway CLI

```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Or using Homebrew (macOS)
brew install railway

# Verify installation
railway --version
```

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate. After logging in, you'll be authenticated in the CLI.

## Step 3: Initialize Railway Project

```bash
# Navigate to your project root
cd /Users/oogy/Documents/movietobook

# Initialize Railway project (creates railway.toml if needed)
railway init

# This will prompt you to:
# - Create a new project OR link to existing project
# - Select environment (production, staging, etc.)
```

**OR** if you already have a Railway project:

```bash
# Link to existing project
railway link
# Select your project from the list
```

## Step 4: Set Environment Variables

Set all required environment variables:

```bash
# Supabase
railway variables set NEXT_PUBLIC_SUPABASE_URL=https://iubzlvifqarwuylbhyup.supabase.co
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnpsdmlmcWFyd3V5bGJoeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg3NTgsImV4cCI6MjA4NTEwNDc1OH0.HhRAWPj0UW_ij2EBH625baOXJjG1ZoAUSUQuswxmdH8

# OpenAI
railway variables set OPENAI_API_KEY=your_openai_key_here

# Lemon Squeezy (add these after setup)
railway variables set LEMONSQUEEZY_API_KEY=your_lemonsqueezy_key
railway variables set LEMONSQUEEZY_STORE_ID=your_store_id
railway variables set LEMONSQUEEZY_VARIANT_ID=your_variant_id
railway variables set LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# App Configuration
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set EXTERNAL_API_URL=https://your-railway-app.up.railway.app
```

**Note:** Replace `your-railway-app.up.railway.app` with your actual Railway domain after first deployment.

## Step 5: Deploy to Railway

```bash
# Deploy to current environment (default is usually 'production')
railway up

# Or specify environment explicitly
railway up --environment production
```

This will:
1. Build your Docker image
2. Push to Railway
3. Deploy and start your service

## Step 6: Get Your Deployment URL

```bash
# Get service URL
railway domain

# Or check status
railway status
```

## Step 7: View Logs

```bash
# Stream logs in real-time
railway logs

# Or view logs for specific service
railway logs --service your-service-name
```

## Step 8: Update EXTERNAL_API_URL

After deployment, update the `EXTERNAL_API_URL` variable:

```bash
# Get your Railway domain first
railway domain

# Then set it
railway variables set EXTERNAL_API_URL=https://your-actual-domain.up.railway.app
```

## Quick Commands Reference

```bash
# Login
railway login

# Link to project
railway link

# View current project
railway status

# Set environment variable
railway variables set KEY=value

# View all variables
railway variables

# Deploy
railway up

# View logs
railway logs

# Open Railway dashboard
railway open

# Get service URL
railway domain

# Run command in Railway environment
railway run npm run build

# Open shell in Railway
railway shell
```

## Troubleshooting

### Build fails?
```bash
# Check build logs
railway logs --build

# Test build locally first
docker build -t movie2book-test .
```

### Environment variables not working?
```bash
# List all variables
railway variables

# Check if variable is set correctly
railway variables get VARIABLE_NAME
```

### Service not starting?
```bash
# Check logs
railway logs

# Verify start command in railway.json
cat railway.json
```

### Port issues?
- Railway automatically assigns a PORT environment variable
- Make sure your app uses `process.env.PORT` (Next.js does this automatically)
- Check `start.sh` uses the correct port

## Production Checklist

- [ ] Railway CLI installed and logged in
- [ ] Project initialized/linked
- [ ] All environment variables set
- [ ] Deployed successfully (`railway up`)
- [ ] Service is running (`railway status`)
- [ ] Domain configured (`railway domain`)
- [ ] EXTERNAL_API_URL updated with actual domain
- [ ] Webhook URL updated in Lemon Squeezy
- [ ] Tested checkout flow
- [ ] Tested webhook delivery

## Next Steps After Deployment

1. **Update Lemon Squeezy Webhook URL:**
   - Go to Lemon Squeezy Dashboard → Settings → Webhooks
   - Update webhook URL to: `https://your-railway-domain.up.railway.app/api/webhook/lemonsqueezy`

2. **Test the deployment:**
   - Visit your Railway domain
   - Test signup/login
   - Test video upload
   - Test subscription checkout

3. **Monitor:**
   - Use `railway logs` to monitor in real-time
   - Check Railway dashboard for metrics

## Useful Railway CLI Tips

```bash
# Create a new environment
railway environment create staging

# Switch environments
railway environment use staging

# Deploy to specific environment
railway up --environment staging

# View service metrics
railway metrics

# Scale your service (if needed)
railway scale --replicas 2
```
