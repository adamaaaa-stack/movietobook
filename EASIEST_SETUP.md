# Easiest Free Setup: Replit 🎉

## Why Replit is THE Easiest

✅ **No Docker** - Just paste code  
✅ **No CLI** - Everything in browser  
✅ **No config files** - Just works  
✅ **3 minutes** - Fastest setup  
✅ **Free forever** - $0/month  
✅ **Public URL** - Instant deployment  

---

## Step-by-Step (Copy/Paste!)

### 1. Create Account (30 seconds)
- Go to https://replit.com
- Click "Sign up" → Use GitHub (easiest)
- Done!

### 2. Create New Repl (30 seconds)
- Click "Create Repl" (big green button)
- Choose "Python" template
- Name: `movietobook-api`
- Click "Create Repl"

### 3. Copy Files (1 minute)

**File 1: main.py**
- Open `replit_main.py` from this repo
- Copy ALL contents
- In Replit, delete default code in `main.py`
- Paste the copied code

**File 2: video_to_narrative.py**
- Open `video_to_narrative.py` from this repo
- Copy ALL contents
- In Replit, click "+" → "New file"
- Name it: `video_to_narrative.py`
- Paste the code

**File 3: requirements.txt**
- Open `replit_requirements.txt` from this repo
- Copy ALL contents
- In Replit, replace `requirements.txt` with copied content

**File 4: .replit** (optional but helpful)
- Open `.replit` from this repo
- Copy ALL contents
- In Replit, click "+" → "New file"
- Name it: `.replit`
- Paste the code

### 4. Install FFmpeg (30 seconds)
- In Replit, click "Shell" tab (bottom)
- Type: `pkg install ffmpeg`
- Press Enter
- Wait for installation

### 5. Set Secrets (1 minute)
- Click "Secrets" tab (lock icon on left)
- Click "New secret"
- Add each one:
  ```
  OPENAI_API_KEY = your_openai_key
  NEXT_PUBLIC_SUPABASE_URL = your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY = your_key
  ```
- Click "Add secret" for each

### 6. Run! (10 seconds)
- Click big green "Run" button
- Wait for "Webview" tab to appear
- Your API is LIVE! 🎉

### 7. Get Your URL
- Click "Webview" tab
- Copy the URL (e.g., `https://movietobook-api.yourusername.repl.co`)
- Test it: Add `/health` → `https://movietobook-api.yourusername.repl.co/health`
- Should see: `{"status":"ok"}`

---

## Update Vercel

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add:
   ```
   EXTERNAL_API_URL=https://movietobook-api.yourusername.repl.co
   ```
4. Redeploy

---

## Keep It Running

**Replit Free Tier:**
- Keeps your repl running
- May sleep after inactivity (but wakes quickly)
- Free forever!

**Keep Awake (Optional):**
- Use UptimeRobot (free)
- Ping your URL every 5 minutes
- Keeps it always awake

---

## Cost: $0/month ✅

Replit free tier:
- ✅ Always-on repls
- ✅ Public URLs
- ✅ Unlimited projects
- ✅ Community support

---

## Comparison

| Setup | Time | Complexity | Cost |
|-------|------|------------|------|
| **Replit** | 3 min ⭐ | Easiest ⭐ | Free ✅ |
| Render | 5 min | Easy | Free ✅ |
| Fly.io | 10 min | Medium | Free ✅ |

**Replit wins!** 🏆

---

## Troubleshooting

### "FFmpeg not found"
```bash
# In Replit Shell
pkg install ffmpeg
```

### "Module not found"
- Click "Packages" tab
- Search for missing package
- Click "Install"
- Or add to `requirements.txt` and click "Run"

### "Port already in use"
- Replit handles this automatically
- Just click "Run" again

### "Can't access from Vercel"
- Make sure you copied the URL from "Webview" tab
- Test `/health` endpoint first
- Check CORS is enabled (it is in the code)

---

## That's It!

**Total time: ~3 minutes**  
**Total cost: $0**  
**Total complexity: Minimal**  

Easiest deployment ever! 🚀
