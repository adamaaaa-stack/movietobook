# Render Quick Start Guide 🚀

## Step-by-Step Setup (5 minutes)

### Step 1: Sign Up
1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Render to access your GitHub

### Step 2: Create Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your repository:
   - Search for: `adamaaaa-stack/movietobook`
   - Click **"Connect"**
4. Select branch: **`main`**

### Step 3: Configure Service

**Basic Settings:**
- **Name**: `movie2book` (or any name you like)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: Leave empty

**Build & Start:**
- **Environment**: Select **"Docker"**
- Render will auto-detect your `Dockerfile` ✅
- No need to set build/start commands!

**OR Manual (if Docker doesn't work):**
- **Build Command**: 
  ```
  pip install --no-cache-dir -r requirements_railway.txt && cd movie2book && npm ci && npm run build
  ```
- **Start Command**: 
  ```
  sh start.sh
  ```

### Step 4: Set Environment Variables

Click **"Environment"** tab and add these variables:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://iubzlvifqarwuylbhyup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnpsdmlmcWFyd3V5bGJoeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg3NTgsImV4cCI6MjA4NTEwNDc1OH0.HhRAWPj0UW_ij2EBH625baOXJjG1ZoAUSUQuswxmdH8
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=production
```

**Lemon Squeezy (add when ready):**
```
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID=your_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

**Important:** Leave `EXTERNAL_API_URL` empty for now - we'll set it after deployment!

### Step 5: Deploy!

1. Scroll down and click **"Create Web Service"**
2. Render will:
   - Clone your repo
   - Build using Dockerfile
   - Deploy automatically
3. **Wait 5-10 minutes** for first build
4. Watch the build logs in real-time

### Step 6: Get Your URL & Update Settings

**After deployment completes:**

1. **Get your URL**: 
   - It will be: `https://movie2book.onrender.com` (or similar)
   - Copy this URL

2. **Update EXTERNAL_API_URL**:
   - Go to **Environment** tab
   - Add/Update: `EXTERNAL_API_URL=https://your-app-name.onrender.com`
   - Replace with your actual URL
   - Render will auto-redeploy

3. **Update Lemon Squeezy Webhook**:
   - Go to Lemon Squeezy Dashboard → Settings → Webhooks
   - Update webhook URL to: `https://your-app-name.onrender.com/api/webhook/lemonsqueezy`

## That's It! 🎉

Your app should now be live at: `https://movie2book.onrender.com`

## Troubleshooting

### Build Fails?
- Check build logs in Render dashboard
- Verify Dockerfile is correct
- Check environment variables are set

### App Not Working?
- Check service logs: Click on your service → "Logs" tab
- Verify environment variables are correct
- Check `EXTERNAL_API_URL` is set correctly

### Free Tier Spin-Down?
- Free tier spins down after 15min inactivity
- First request takes ~30 seconds to wake up
- This is normal for free tier
- Upgrade to paid ($7/month) for always-on

## Next Steps

1. ✅ Test your app: Visit your Render URL
2. ✅ Test signup/login
3. ✅ Test video upload
4. ✅ Update Lemon Squeezy webhook
5. ✅ Share your app! 🚀

## Need Help?

- Render Docs: https://render.com/docs
- Render Support: support@render.com
- Check build logs in dashboard

Good luck! 🎬📚
