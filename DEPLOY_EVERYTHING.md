# Deploy Everything - Complete App Deployment 🚀

## Option 1: Render (Everything Free) ⭐ RECOMMENDED

Deploy both frontend (Next.js) and backend (Python) on Render - **both free!**

### What Gets Deployed:
- ✅ Next.js frontend (all your pages, UI, etc.)
- ✅ Python backend API (video processing)
- ✅ Everything in one place
- ✅ Free forever

---

## Quick Setup (10 minutes)

### Step 1: Prepare Your Repo

Make sure everything is pushed to GitHub:
```bash
cd /Users/oogy/Documents/movietobook
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy Backend (Python API)

1. Go to https://render.com → Sign up (free)
2. Click "New +" → "Web Service"
3. Connect GitHub repo: `adamaaaa-stack/movietobook`
4. Configure:
   ```
   Name: movietobook-backend
   Region: Choose closest
   Branch: main
   Root Directory: (leave empty)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt && pip install -r requirements_api.txt
   Start Command: cd /opt/render/project/src && gunicorn api_server:app --bind 0.0.0.0:$PORT --workers 1 --timeout 3600
   Instance Type: Free
   ```
5. Add Environment Variables:
   ```
   OPENAI_API_KEY=your_key
   PORT=10000
   (Add all other vars)
   ```
6. Click "Create Web Service"
7. Copy the URL: `https://movietobook-backend.onrender.com`

### Step 3: Deploy Frontend (Next.js)

1. Still in Render, click "New +" → "Web Service"
2. Connect same GitHub repo
3. Configure:
   ```
   Name: movietobook-frontend
   Region: Same as backend
   Branch: main
   Root Directory: movie2book
   Runtime: Node
   Build Command: cd movie2book && npm install && npm run build
   Start Command: cd movie2book && npm start
   Instance Type: Free
   ```
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   EXTERNAL_API_URL=https://movietobook-backend.onrender.com
   LEMONSQUEEZY_API_KEY=your_key
   LEMONSQUEEZY_STORE_ID=your_id
   LEMONSQUEEZY_VARIANT_ID=your_id
   LEMONSQUEEZY_WEBHOOK_SECRET=your_secret
   OPENAI_API_KEY=your_key
   ```
5. Click "Create Web Service"
6. Your app is live! 🎉

---

## Option 2: Vercel (Frontend) + Render (Backend)

Keep frontend on Vercel (better CDN), backend on Render.

### Frontend on Vercel:
1. Go to vercel.com
2. Import GitHub repo
3. Root Directory: `movie2book`
4. Add environment variables
5. Deploy!

### Backend on Render:
- Follow Step 2 above

**Advantage:** Vercel has better CDN for frontend, Render handles backend.

---

## Option 3: Everything on Railway (Paid)

Railway can deploy both, but costs $5/month. Not free.

---

## Recommended: Option 1 (Render Everything) ⭐

**Why:**
- ✅ Everything in one place
- ✅ Free forever
- ✅ Easy to manage
- ✅ Auto-deploys from GitHub

**Trade-off:**
- ⚠️ Frontend may sleep after 15min (cold start ~30s)
- ✅ Backend can stay awake with UptimeRobot

---

## Cost Breakdown

| Service | Frontend | Backend | Total |
|---------|----------|---------|-------|
| **Render** | Free ✅ | Free ✅ | **$0/month** |
| **Vercel + Render** | Free ✅ | Free ✅ | **$0/month** |

Both are free! 🎉

---

## Environment Variables Needed

### Backend (Render):
```
OPENAI_API_KEY
PORT=10000
```

### Frontend (Render or Vercel):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
EXTERNAL_API_URL=https://movietobook-backend.onrender.com
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_VARIANT_ID
LEMONSQUEEZY_WEBHOOK_SECRET
```

---

## Keep Services Awake (Optional)

**UptimeRobot (Free):**
1. Sign up: https://uptimerobot.com
2. Add monitors:
   - Backend: `https://movietobook-backend.onrender.com/health`
   - Frontend: `https://movietobook-frontend.onrender.com`
3. Interval: 5 minutes
4. Keeps both awake! ✅

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy backend on Render
3. ✅ Deploy frontend on Render
4. ✅ Add environment variables
5. ✅ Test your app!

---

## Troubleshooting

### Frontend build fails:
- Check `movie2book/package.json` has all dependencies
- Verify Node version (Render uses Node 18+)
- Check build logs in Render dashboard

### Backend won't start:
- Verify Python version (3.11+)
- Check `requirements.txt` has all packages
- Check start command path is correct

### Can't connect frontend to backend:
- Verify `EXTERNAL_API_URL` is set correctly
- Check backend URL is accessible
- Test backend `/health` endpoint

---

## That's It!

**Total time: ~10 minutes**  
**Total cost: $0**  
**Everything deployed!** 🚀
