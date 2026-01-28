# Railway Single App Setup 🚂

## Deploy Everything on Railway (Single App)

Railway is perfect for single app deployments - just like Koyeb but with better free tier!

---

## Quick Setup (5 minutes)

### Step 1: Install Railway CLI
```bash
npm i -g @railway/cli
```

### Step 2: Login
```bash
railway login
```

### Step 3: Initialize Project
```bash
cd /Users/oogy/Documents/movietobook
railway init
```

**When prompted:**
- Project name: `movietobook` (or any name)
- Environment: Production
- It will detect `railway.json` automatically ✅

### Step 4: Deploy
```bash
railway up
```

**That's it!** Railway will:
- Build using `railway.json` config
- Start with `start.sh`
- Give you a URL

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

Railway auto-detects this file! ✅

---

## Environment Variables

### Set in Railway Dashboard:

**Option 1: Via CLI**
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

**Option 2: Via Dashboard**
1. Go to https://railway.app
2. Your project → Variables tab
3. Add each variable

---

## How It Works

**Same as Koyeb:**
1. Railway builds using `railway.json`
2. Runs `start.sh` which starts:
   - Python API on port 8080 (background)
   - Next.js on port 3000 (foreground)
3. Railway exposes port 3000
4. Frontend calls backend via `localhost:8080`

---

## Railway vs Koyeb

| Feature | Railway | Koyeb |
|---------|---------|-------|
| **Free Tier** | $5 credit/month | 512MB RAM |
| **Ease** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Auto-Deploy** | ✅ GitHub | ✅ GitHub |
| **CLI** | ✅ Yes | ❌ No |
| **Cost** | $5/month | Free |

**Railway:** Better resources, paid  
**Koyeb:** Free, but tighter limits

---

## Quick Commands

```bash
# Deploy
railway up

# View logs
railway logs

# Open dashboard
railway open

# Get URL
railway domain

# Set variables
railway variables set KEY=value
```

---

## Cost

**Railway:**
- Free: $5 credit/month (enough for testing)
- Paid: $5/month + usage (very affordable)

**For your use case:** ~$5-10/month

---

## Next Steps

1. ✅ Install Railway CLI
2. ✅ Run `railway init`
3. ✅ Set environment variables
4. ✅ Run `railway up`
5. ✅ Get your URL!

**Everything is configured!** Just run the commands above. 🚂
