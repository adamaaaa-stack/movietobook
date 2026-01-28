# Free Deployment Options

## 🎯 Best Free Setup: Vercel (Frontend) + Render (Backend)

### Why This Works:
- ✅ **Vercel**: Free forever for Next.js (generous limits)
- ✅ **Render**: Free tier available (with some limitations)
- ✅ Both auto-deploy from GitHub
- ✅ Easy setup

---

## Option 1: Render (Recommended Free Option) ⭐

**Free Tier Includes:**
- 750 hours/month (enough for 24/7 if you use 1 service)
- 512MB RAM
- Auto-deploys from GitHub
- Free SSL
- Sleeps after 15min inactivity (wakes on request)

**Limitations:**
- Services sleep after 15min inactivity (adds ~30s cold start)
- 512MB RAM (should be enough for video processing)
- Slower than paid tiers

**Setup:**
1. Go to https://render.com
2. Sign up (free)
3. New → Web Service
4. Connect GitHub repo
5. Settings:
   - **Build Command:** `pip install -r requirements.txt && pip install -r requirements_api.txt`
   - **Start Command:** `gunicorn api_server:app --bind 0.0.0.0:$PORT --workers 1 --timeout 3600`
   - **Environment:** Python 3
6. Add environment variables
7. Deploy!

**Cost:** $0/month ✅

---

## Option 2: Fly.io (Free Tier)

**Free Tier Includes:**
- 3 shared-cpu VMs
- 3GB persistent volumes
- 160GB outbound data transfer
- No sleep (always on)

**Setup:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `fly auth signup`
3. Create app: `fly launch`
4. Deploy: `fly deploy`

**Cost:** $0/month ✅

**Note:** Requires Dockerfile (I can create one)

---

## Option 3: Google Cloud Run (Free Tier)

**Free Tier Includes:**
- 2 million requests/month
- 360,000 GB-seconds compute
- 180,000 vCPU-seconds
- Auto-scales to zero

**Setup:**
- More complex, requires Google Cloud account
- Good for production but setup is harder

**Cost:** $0/month (within free tier limits) ✅

---

## Option 4: Replit (Free Tier)

**Free Tier:**
- Always-on Repls available
- Can run Python + FFmpeg
- Less reliable than Render/Fly.io

**Cost:** $0/month ✅

---

## Recommended: Render (Easiest Free Option)

### Step-by-Step Render Setup:

1. **Create Account:**
   - Go to https://render.com
   - Sign up with GitHub (free)

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select the `movietobook` repository

3. **Configure Service:**
   ```
   Name: movietobook-api
   Region: Oregon (or closest to you)
   Branch: main
   Root Directory: (leave empty, or set to root)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt && pip install -r requirements_api.txt
   Start Command: gunicorn api_server:app --bind 0.0.0.0:$PORT --workers 1 --timeout 3600
   ```

4. **Add Environment Variables:**
   ```
   OPENAI_API_KEY=your_key
   PORT=10000
   (Add all other vars from .env)
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete
   - Copy your service URL (e.g., `https://movietobook-api.onrender.com`)

6. **Update Vercel:**
   - Add env var: `RAILWAY_API_URL=https://movietobook-api.onrender.com`
   - (Yes, keep the var name as RAILWAY_API_URL for compatibility)

---

## Important Notes for Free Tiers:

### Render Free Tier:
- ⚠️ **Sleeps after 15min**: First request after sleep takes ~30s to wake up
- ✅ **Solution**: Use a ping service (UptimeRobot - free) to keep it awake
- ✅ **Or**: Accept the cold start delay

### Fly.io Free Tier:
- ✅ **No sleep**: Always on
- ⚠️ **Limited resources**: May need to optimize for 512MB RAM

---

## Cost Comparison (All Free):

| Service | Frontend | Backend | Total |
|---------|----------|---------|-------|
| **Vercel + Render** | Free ✅ | Free ✅ | **$0** ⭐ |
| **Vercel + Fly.io** | Free ✅ | Free ✅ | **$0** |
| **Vercel + Cloud Run** | Free ✅ | Free ✅ | **$0** |

---

## Quick Start: Render (Recommended)

I'll create a `render.yaml` file for one-click deployment:

```yaml
services:
  - type: web
    name: movietobook-api
    runtime: python
    buildCommand: pip install -r requirements.txt && pip install -r requirements_api.txt
    startCommand: gunicorn api_server:app --bind 0.0.0.0:$PORT --workers 1 --timeout 3600
    envVars:
      - key: OPENAI_API_KEY
        sync: false  # You'll set this in dashboard
      - key: PORT
        value: 10000
```

Then just:
1. Push to GitHub
2. Connect Render to GitHub
3. Render auto-detects `render.yaml`
4. Deploy!

---

## Keep Service Awake (Optional)

If using Render free tier, add a cron job to ping your service:

**UptimeRobot (Free):**
1. Sign up at https://uptimerobot.com
2. Add monitor
3. URL: `https://your-app.onrender.com/health`
4. Interval: 5 minutes
5. Keeps service awake ✅

---

## Next Steps:

1. ✅ I've created `api_server.py` (ready to deploy)
2. ✅ I've created `requirements_api.txt`
3. ✅ I've created `Procfile` (for Render)
4. ⏭️ Update Vercel routes to call Render API
5. ⏭️ Deploy to Render

Would you like me to:
- Create `render.yaml` for easy deployment?
- Update Vercel API routes to use Render API?
- Create a Dockerfile for Fly.io option?
