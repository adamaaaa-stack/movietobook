# Replit Setup - Easiest Free Option! 🎉

## Why Replit?

✅ **Easiest setup** - Just copy/paste code, click Run  
✅ **No Docker** - No CLI - No config files  
✅ **Free forever** - Generous free tier  
✅ **Always on** - Can keep running 24/7  
✅ **Built-in editor** - Code, run, deploy all in browser  
✅ **FFmpeg available** - Can install via package manager  

---

## Quick Setup (3 minutes!)

### Step 1: Create Replit Account
1. Go to https://replit.com
2. Sign up (free) - Use GitHub login (easiest)

### Step 2: Create New Repl
1. Click "Create Repl"
2. Choose "Python" template
3. Name it: `movietobook-api`

### Step 3: Copy Files
1. Copy `api_server.py` → Paste into `main.py`
2. Copy `requirements.txt` → Paste into `requirements.txt`
3. Copy `requirements_api.txt` → Merge into `requirements.txt`
4. Copy `video_to_narrative.py` → Paste into `video_to_narrative.py`

### Step 4: Install FFmpeg
In Replit Shell, run:
```bash
pkg install ffmpeg
```

### Step 5: Set Secrets
1. Click "Secrets" tab (lock icon)
2. Add:
   - `OPENAI_API_KEY` = your_key
   - `NEXT_PUBLIC_SUPABASE_URL` = your_url
   - (Add all other env vars)

### Step 6: Run!
1. Click "Run" button
2. Your API is live! 🎉

### Step 7: Get Public URL
1. Click "Webview" tab
2. Copy the URL (e.g., `https://movietobook-api.yourusername.repl.co`)
3. Add `/health` to test: `https://movietobook-api.yourusername.repl.co/health`

---

## Keep It Running (Free)

**Option 1: Always On (Free Tier)**
- Replit free tier keeps your repl running
- May sleep after inactivity (but wakes quickly)

**Option 2: UptimeRobot (Free)**
- Sign up: https://uptimerobot.com
- Add monitor for your Replit URL
- Pings every 5 minutes (keeps it awake)

---

## Cost: $0/month ✅

Replit free tier includes:
- ✅ Always-on repls
- ✅ Public URLs
- ✅ Unlimited projects
- ✅ Community support

---

## Advantages

| Feature | Replit | Fly.io | Render |
|---------|--------|--------|--------|
| **Setup Time** | 3 min ✅ | 10 min | 5 min |
| **Docker Needed** | ❌ No | ✅ Yes | ❌ No |
| **CLI Needed** | ❌ No | ✅ Yes | ❌ No |
| **Complexity** | ⭐ Easiest | ⭐⭐⭐ | ⭐⭐ |
| **Cost** | Free ✅ | Free ✅ | Free ✅ |

---

## Files to Copy to Replit

1. **main.py** → Copy from `api_server.py`
2. **requirements.txt** → Merge `requirements.txt` + `requirements_api.txt`
3. **video_to_narrative.py** → Copy as-is
4. **.replit** → I'll create this config file

---

## Replit-Specific Setup

### Create `.replit` file:
```toml
run = "python main.py"
entrypoint = "main.py"
```

### Update `main.py` (api_server.py):
- Change port to use Replit's `PORT` env var
- Replit provides this automatically

---

## Troubleshooting

### FFmpeg not found:
```bash
# In Replit Shell
pkg install ffmpeg
```

### Port issues:
- Replit auto-assigns PORT
- Use `os.environ.get('PORT', 8080)`

### Import errors:
- Click "Packages" tab
- Search and install missing packages
- Or add to `requirements.txt`

---

## Next Steps

1. ✅ Create Replit account
2. ✅ Create Python repl
3. ✅ Copy files (I'll prepare them)
4. ✅ Install FFmpeg
5. ✅ Set secrets
6. ✅ Run and get URL
7. ✅ Update Vercel with Replit URL

---

## Even Easier Alternative: PythonAnywhere

If Replit seems too complex, try **PythonAnywhere**:

1. Go to https://www.pythonanywhere.com
2. Sign up (free)
3. Upload files via web interface
4. Run via web console
5. Get public URL

**But Replit is easier!** ⭐
