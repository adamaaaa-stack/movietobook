# Koyeb Setup - Easiest Alternative to Vercel! 🎉

## Why Koyeb is Perfect

✅ **Just like Vercel** - Connect GitHub, auto-deploy  
✅ **Supports Python** - Unlike Vercel  
✅ **Free tier** - $0/month  
✅ **Auto-detects** - Recognizes your app  
✅ **No config needed** - Works out of the box  

---

## Quick Setup (2 minutes!)

### Step 1: Sign Up
1. Go to https://www.koyeb.com
2. Click "Get Started" (free)
3. Sign up with GitHub (easiest)

### Step 2: Create App
1. Click "Create App" (big button)
2. Click "GitHub" tab
3. Authorize Koyeb to access GitHub
4. Select repository: `adamaaaa-stack/movietobook`
5. Click "Next"

### Step 3: Configure (Auto-detected!)
Koyeb will auto-detect:
- ✅ Python runtime
- ✅ Build command: `pip install -r requirements.txt`
- ✅ Start command: `python api_server.py`

**You can leave defaults!** Or customize if needed.

### Step 4: Set Environment Variables
1. Scroll to "Environment Variables"
2. Click "Add Variable"
3. Add each:
   ```
   OPENAI_API_KEY = your_key
   PORT = 8080
   NEXT_PUBLIC_SUPABASE_URL = your_url (if needed)
   ```
4. Click "Add" for each

### Step 5: Deploy!
1. Click "Deploy" button
2. Wait 2-3 minutes
3. **Done!** 🎉

### Step 6: Get Your URL
- After deployment, you'll see your app URL
- Example: `https://movietobook-api-xxxxx.koyeb.app`
- Test: `https://movietobook-api-xxxxx.koyeb.app/health`

---

## Update Vercel Frontend

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add:
   ```
   EXTERNAL_API_URL=https://movietobook-api-xxxxx.koyeb.app
   ```
4. Redeploy Vercel

---

## Files Needed

Koyeb needs these files in your repo:

**Required:**
- `api_server.py` (or rename `replit_main.py` to `api_server.py`)
- `video_to_narrative.py`
- `requirements.txt` (merge with `requirements_api.txt`)

**Optional:**
- `koyeb.toml` (I'll create this for custom config)

---

## Create `koyeb.toml` (Optional)

Create this file in your repo root:

```toml
[build]
builder = "nixpacks"

[run]
cmd = "python api_server.py"
```

**But Koyeb works without it!** Auto-detection is smart enough.

---

## Cost: $0/month ✅

Koyeb free tier includes:
- ✅ 2 services
- ✅ Auto-deploy from GitHub
- ✅ Public URLs
- ✅ Environment variables
- ✅ Logs and monitoring

---

## Advantages Over Other Options

| Feature | Koyeb | Render | Replit |
|---------|-------|--------|--------|
| **Ease** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **GitHub Auto-Deploy** | ✅ Yes | ✅ Yes | ❌ No |
| **Auto-Detect** | ✅ Yes | ✅ Yes | ❌ No |
| **Setup Time** | 2 min | 3 min | 10 min |
| **Cost** | Free ✅ | Free ✅ | Free ✅ |

**Koyeb is the easiest!** 🏆

---

## Troubleshooting

### Build Fails:
- Check Koyeb logs (in dashboard)
- Ensure `requirements.txt` has all dependencies
- Check Python version (Koyeb uses 3.11 by default)

### App Won't Start:
- Check start command is correct
- Verify PORT environment variable
- Check logs for errors

### Can't Connect from Vercel:
- Verify Koyeb URL is correct
- Test `/health` endpoint first
- Check CORS is enabled (it is in `api_server.py`)

---

## Next Steps

1. ✅ Push `api_server.py` to GitHub (if not already)
2. ✅ Push `video_to_narrative.py` to GitHub
3. ✅ Push `requirements.txt` to GitHub
4. ✅ Deploy on Koyeb (2 minutes!)
5. ✅ Update Vercel with Koyeb URL
6. ✅ Test end-to-end

**Total time: ~5 minutes**  
**Total cost: $0**  
**Ease: Just like Vercel!** 🚀

---

## Why Koyeb > Others

**vs Render:**
- ✅ Faster setup (2 min vs 3 min)
- ✅ Better auto-detection
- ✅ Cleaner interface

**vs Replit:**
- ✅ GitHub auto-deploy (no copy/paste)
- ✅ Professional deployment
- ✅ Better for production

**vs Railway:**
- ✅ Free (Railway is $5/month)
- ✅ Same ease level

**Koyeb is the winner!** 🏆
