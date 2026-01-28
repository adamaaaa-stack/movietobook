# Render Deployment Guide - Much Easier Than Railway! 🚀

## Why Render?

✅ **Much simpler** - No service linking issues  
✅ **Deploy from GitHub** - Automatic deployments  
✅ **Supports Python + Node.js** - Perfect for your app  
✅ **Free tier available** - $0/month with limitations  
✅ **Better documentation** - Clearer setup process  
✅ **No CLI needed** - Everything via dashboard  

## Quick Setup (5 minutes)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easiest)
3. Connect your GitHub account

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your repository: `adamaaaa-stack/movietobook`
3. Select branch: `main`

### Step 3: Configure Service

**Basic Settings:**
- **Name**: `movie2book`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty (or `/`)

**Build & Start:**
- **Build Command**: 
  ```bash
  pip install --no-cache-dir -r requirements_railway.txt && cd movie2book && npm ci && npm run build
  ```
- **Start Command**: 
  ```bash
  sh start.sh
  ```

**Environment:**
- **Environment**: `Docker` (or `Dockerfile`)

**OR use Dockerfile (recommended):**
- Render will auto-detect your `Dockerfile`
- No need to set build/start commands

### Step 4: Set Environment Variables

Click **"Environment"** tab and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://iubzlvifqarwuylbhyup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnpsdmlmcWFyd3V5bGJoeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg3NTgsImV4cCI6MjA4NTEwNDc1OH0.HhRAWPj0UW_ij2EBH625baOXJjG1ZoAUSUQuswxmdH8
OPENAI_API_KEY=your_openai_key
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID=your_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
PORT=3000
NODE_ENV=production
EXTERNAL_API_URL=https://your-app-name.onrender.com
```

**Note:** Update `EXTERNAL_API_URL` after first deployment with your actual Render URL.

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repo
   - Build using Dockerfile
   - Deploy automatically
3. Wait 5-10 minutes for first build
4. Get your URL: `https://movie2book.onrender.com`

## Advantages Over Railway

| Feature | Railway | Render |
|---------|---------|--------|
| Setup Complexity | ⭐⭐ (service linking issues) | ⭐⭐⭐⭐⭐ (just connect GitHub) |
| CLI Required | Yes | No (optional) |
| Dashboard | Good | Excellent |
| Free Tier | Limited | Better |
| Documentation | Good | Better |
| Auto Deploy | Yes | Yes |
| Build Logs | Good | Excellent |

## Render Free Tier

- **512MB RAM** (enough for your app)
- **0.1 CPU** (sufficient)
- **100GB bandwidth/month**
- **Spins down after 15min inactivity** (wakes up on first request)
- **Unlimited builds**

## After Deployment

1. **Get your URL**: `https://movie2book.onrender.com`
2. **Update EXTERNAL_API_URL**:
   - Go to Environment tab
   - Update `EXTERNAL_API_URL` to your Render URL
3. **Update Lemon Squeezy webhook**:
   - Set webhook URL to: `https://movie2book.onrender.com/api/webhook/lemonsqueezy`

## Troubleshooting

### Build Fails?
- Check build logs in Render dashboard
- Verify Dockerfile is correct
- Check environment variables are set

### App Spins Down?
- Free tier spins down after 15min inactivity
- First request takes ~30 seconds to wake up
- Upgrade to paid ($7/month) for always-on

### Port Issues?
- Render sets `PORT` automatically
- Your `start.sh` already uses `$PORT`
- Should work out of the box

## Upgrade to Paid ($7/month)

If you want:
- ✅ Always-on (no spin-down)
- ✅ Faster builds
- ✅ More resources
- ✅ Better performance

Just upgrade in Render dashboard → Billing

## Next Steps

1. ✅ Sign up at render.com
2. ✅ Connect GitHub repo
3. ✅ Create Web Service
4. ✅ Set environment variables
5. ✅ Deploy!
6. ✅ Update EXTERNAL_API_URL
7. ✅ Update Lemon Squeezy webhook

**That's it! Much simpler than Railway!** 🎉
