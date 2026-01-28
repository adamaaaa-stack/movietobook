# Free Deployment: Render Setup Guide

## 🎯 Complete Free Setup (Vercel + Render)

### Step 1: Deploy Backend to Render (FREE)

1. **Sign Up:**
   - Go to https://render.com
   - Click "Get Started for Free"
   - Sign up with GitHub (easiest)

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `adamaaaa-stack/movietobook`
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: movietobook-api
   Region: Choose closest to you
   Branch: main
   Root Directory: (leave empty)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt && pip install -r requirements_api.txt
   Start Command: gunicorn api_server:app --bind 0.0.0.0:$PORT --workers 1 --timeout 3600
   Instance Type: Free
   ```

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   Add these:
   ```
   OPENAI_API_KEY=your_openai_key
   PORT=10000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url (if needed)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key (if needed)
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for build (5-10 minutes first time)
   - Copy your service URL (e.g., `https://movietobook-api.onrender.com`)

6. **Test:**
   - Visit: `https://your-app.onrender.com/health`
   - Should see: `{"status":"ok"}`

---

### Step 2: Update Vercel Frontend

1. **Go to Vercel Dashboard:**
   - Your project → Settings → Environment Variables

2. **Add Environment Variable:**
   ```
   EXTERNAL_API_URL=https://your-app.onrender.com
   ```
   (Or use `RAILWAY_API_URL` - both work)

3. **Update Code:**
   - Replace `/api/upload` calls with `/api/upload-railway`
   - Replace `/api/status` calls with `/api/status-external`
   - Replace `/api/result` calls with `/api/result-external`

   **OR** update existing routes to use external API (I can do this)

4. **Redeploy Vercel:**
   - Push changes to GitHub
   - Vercel auto-deploys

---

### Step 3: Keep Render Awake (Optional)

Render free tier sleeps after 15min inactivity. To keep it awake:

**Option A: UptimeRobot (Free)**
1. Sign up: https://uptimerobot.com
2. Add monitor:
   - URL: `https://your-app.onrender.com/health`
   - Interval: 5 minutes
   - Type: HTTP(s)

**Option B: Accept Cold Start**
- First request after sleep takes ~30s
- Subsequent requests are fast
- Free, so acceptable trade-off

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** | Free | $0 ✅ |
| **Render** | Free | $0 ✅ |
| **Supabase** | Free | $0 ✅ |
| **Total** | | **$0/month** 🎉 |

---

## Render Free Tier Limits

- ✅ 750 hours/month (enough for 24/7)
- ✅ 512MB RAM (enough for video processing)
- ✅ Auto-deploys from GitHub
- ⚠️ Sleeps after 15min (adds ~30s cold start)
- ⚠️ Slower than paid tiers (but free!)

---

## Troubleshooting

### Build Fails:
- Check build logs in Render dashboard
- Ensure `requirements.txt` has all dependencies
- Check Python version (should be 3.11+)

### Service Won't Start:
- Check start command is correct
- Verify PORT environment variable
- Check logs in Render dashboard

### 404 Errors:
- Verify service URL is correct
- Check environment variable `EXTERNAL_API_URL` in Vercel
- Test API directly: `https://your-app.onrender.com/health`

### Slow First Request:
- Normal for free tier (cold start)
- Use UptimeRobot to keep awake
- Or upgrade to paid ($7/month removes sleep)

---

## Next Steps

1. ✅ Deploy to Render (follow steps above)
2. ✅ Add `EXTERNAL_API_URL` to Vercel
3. ⏭️ Update Vercel routes (I can do this)
4. ⏭️ Test end-to-end

Would you like me to:
- Update all Vercel API routes to use external API automatically?
- Create a script to switch between local/external API?
- Set up UptimeRobot configuration?
