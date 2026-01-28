# Fix Koyeb Build Error 🛠️

## Problem: Docker Build Timeout

Koyeb is trying to build a Docker container but timing out. This usually means:
- Build is taking too long
- Missing dependencies
- Incorrect build configuration

---

## Solution 1: Use Nixpacks (Recommended)

Koyeb can use Nixpacks instead of Docker, which is faster and easier.

### Step 1: Create `nixpacks.toml`
✅ **Created!** This tells Koyeb how to build your app.

### Step 2: In Koyeb Dashboard

**Go to your app → Settings → Build:**

**Change Builder:**
- From: Docker
- To: **Nixpacks** (or Auto-detect)

**Build Command:** (Leave empty - Nixpacks will use `nixpacks.toml`)

**Start Command:**
```
sh start.sh
```

**Port:**
```
3000
```

---

## Solution 2: Optimize Build (If Still Fails)

### Faster Build Command:

Instead of installing everything at once, optimize:

**Build Command:**
```bash
pip install --no-cache-dir -r requirements.txt flask flask-cors gunicorn && cd movie2book && npm ci --prefer-offline
```

**Why:**
- `--no-cache-dir` - Faster pip installs
- `npm ci` - Faster, more reliable than `npm install`
- `--prefer-offline` - Uses cache if available

---

## Solution 3: Split Build Steps

If build still times out, split into phases:

**Phase 1 - Python:**
```bash
pip install --no-cache-dir -r requirements.txt flask flask-cors gunicorn
```

**Phase 2 - Node:**
```bash
cd movie2book && npm ci
```

**Phase 3 - Build (optional):**
```bash
cd movie2book && npm run build
```

---

## Solution 4: Use Pre-built Dependencies

Create a `.dockerignore` to exclude unnecessary files:

```
node_modules/
.next/
__pycache__/
*.pyc
.git/
.env
.env.local
```

---

## Solution 5: Check What's Slowing Down

**Common culprits:**
1. **OpenCV** - Large package, takes time to build
2. **Whisper** - Downloads model (~75MB)
3. **Node modules** - Large dependency tree
4. **FFmpeg** - System package installation

**Optimizations:**
- Use pre-built wheels for OpenCV
- Download Whisper model on first run (not during build)
- Use `npm ci` instead of `npm install`

---

## Quick Fix: Update Koyeb Settings

### In Koyeb Dashboard:

1. **Go to your app**
2. **Settings → Build**
3. **Change Builder to: Nixpacks** (or remove Dockerfile if exists)
4. **Build Command:** Leave empty (uses `nixpacks.toml`)
5. **Start Command:** `sh start.sh`
6. **Redeploy**

---

## Alternative: Simplify Build

### Minimal Build Command:

```bash
pip install flask flask-cors gunicorn opencv-python-headless openai python-dotenv openai-whisper && cd movie2book && npm install
```

**Why:** Installs only what's needed, avoids heavy dependencies during build.

---

## Check Logs

**In Koyeb Dashboard:**
1. Go to your app
2. Click "Logs" tab
3. Look for:
   - What's taking long?
   - Any errors?
   - Which step fails?

**Common issues:**
- "Installing opencv-python..." - Takes 5-10 minutes
- "Downloading Whisper model..." - Should happen at runtime, not build
- "npm install" - Can be slow with many packages

---

## Recommended: Use Nixpacks

**Why Nixpacks:**
- ✅ Faster builds
- ✅ Auto-detects Python + Node.js
- ✅ Handles FFmpeg automatically
- ✅ Less configuration needed

**Steps:**
1. ✅ I created `nixpacks.toml`
2. ⏭️ Change Koyeb builder to Nixpacks
3. ⏭️ Redeploy

---

## If Still Fails: Use Two Apps

**Split deployment:**
- Frontend app: Just Next.js (faster build)
- Backend app: Just Python (faster build)

**Then connect them** - might be more reliable!

---

## Next Steps

1. ✅ Push `nixpacks.toml` to GitHub
2. ✅ Change Koyeb builder to Nixpacks
3. ✅ Remove Dockerfile if it exists
4. ✅ Redeploy
5. ✅ Check logs if it still fails

Let me know what the logs say and I can help debug further!
