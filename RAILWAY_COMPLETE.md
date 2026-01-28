# Railway Complete Setup Guide 🚂

## Single App Deployment on Railway

Railway is perfect for your setup - easy deployment, good free tier, auto-deploys from GitHub!

---

## Why Railway?

✅ **Easy setup** - Just `railway init` and `railway up`  
✅ **Auto-detects** - Uses `railway.json` automatically  
✅ **GitHub integration** - Auto-deploys on push  
✅ **Good free tier** - $5 credit/month  
✅ **Better resources** - More RAM/CPU than Koyeb free tier  

---

## Quick Start (5 minutes)

### Step 1: Install Railway CLI
```bash
npm i -g @railway/cli
```

### Step 2: Login
```bash
railway login
```
Opens browser to authenticate.

### Step 3: Initialize Project
```bash
cd /Users/oogy/Documents/movietobook
railway init
```

**Prompts:**
- Project name: `movietobook`
- Environment: Production
- Railway detects `railway.json` automatically ✅

### Step 4: Set Environment Variables

**Via CLI:**
```bash
railway variables set OPENAI_API_KEY=your_key
railway variables set PORT=8080
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
railway variables set LEMONSQUEEZY_API_KEY=your_key
railway variables set LEMONSQUEEZY_STORE_ID=your_id
railway variables set LEMONSQUEEZY_VARIANT_ID=your_id
railway variables set EXTERNAL_API_URL=http://localhost:8080
```

**Or via Dashboard:**
- Go to railway.app → Your project → Variables → Add Variable

### Step 5: Deploy
```bash
railway up
```

**That's it!** Railway will:
- Build using `railway.json`
- Start with `start.sh`
- Give you a URL

### Step 6: Get Your URL
```bash
railway domain
```

Or check Railway dashboard!

---

## Railway Configuration

### `railway.json` (Already Created!)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install --no-cache-dir -r requirements_koyeb.txt && cd movie2book && npm ci"
  },
  "deploy": {
    "startCommand": "sh start.sh"
  }
}
```

Railway auto-detects this! ✅

---

## How It Works

**Same as Koyeb:**
1. Railway builds using `railway.json`
2. Runs `start.sh`:
   - Python API on port 8080 (background)
   - Next.js on port 3000 (foreground)
3. Railway exposes port 3000
4. Frontend calls backend via `localhost:8080`

---

## Updated Routes

I've updated your routes to work with Railway:

- ✅ `app/upload/page.tsx` → Uses `/api/upload-railway`
- ✅ `app/api/upload-railway/route.ts` → Calls backend
- ✅ `app/api/status-external/route.ts` → Works with Railway
- ✅ `app/api/result-external/route.ts` → Works with Railway

**All routes default to `localhost:8080` for single app!** ✅

---

## Railway vs Koyeb

| Feature | Railway | Koyeb |
|---------|---------|-------|
| **Free Tier** | $5 credit/month | 512MB RAM |
| **Setup** | CLI + Dashboard | Dashboard only |
| **Ease** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Resources** | Better | Limited |
| **Cost** | $5/month | Free |

**Railway:** Better for production, paid  
**Koyeb:** Easier setup, free but limited

---

## Useful Railway Commands

```bash
# Deploy
railway up

# View logs
railway logs

# Open dashboard
railway open

# Get URL
railway domain

# Set variable
railway variables set KEY=value

# List variables
railway variables

# Connect to GitHub (auto-deploy)
railway link
```

---

## GitHub Auto-Deploy

### Connect GitHub:

```bash
railway link
```

**Or via Dashboard:**
1. Go to railway.app
2. Your project → Settings → Connect GitHub
3. Select repo: `adamaaaa-stack/movietobook`
4. Enable auto-deploy ✅

**Now:** Push to GitHub → Railway auto-deploys! 🚀

---

## Cost

**Railway Pricing:**
- **Free:** $5 credit/month (enough for testing)
- **Starter:** $5/month + usage (~$5-10/month total)
- **Pro:** $20/month + usage

**For your use case:** ~$5-10/month

**Worth it for:**
- ✅ Better resources (more RAM/CPU)
- ✅ More reliable
- ✅ Better for production

---

## Troubleshooting

### Build fails:
```bash
railway logs
# Check what's failing
```

### App won't start:
```bash
railway logs
# Check for errors
```

### Variables not working:
```bash
railway variables
# Verify they're set
```

### Port issues:
- Railway handles ports automatically
- Use `PORT` env var if needed
- Frontend: 3000, Backend: 8080

---

## Next Steps

1. ✅ Install Railway CLI
2. ✅ Run `railway init`
3. ✅ Set environment variables
4. ✅ Run `railway up`
5. ✅ Connect GitHub (optional)
6. ✅ Test!

**Everything is configured!** Just run the commands! 🚂
