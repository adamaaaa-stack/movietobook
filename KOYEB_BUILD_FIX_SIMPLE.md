# Fix Koyeb Build Timeout - Quick Fix 🚀

## Problem
Docker build is timing out (taking too long).

## Solution: Use Nixpacks Instead

Koyeb supports Nixpacks which is faster than Docker for this setup.

---

## Quick Fix (3 Steps)

### Step 1: In Koyeb Dashboard

**Go to your app → Settings → Build:**

**Change Builder:**
- **From:** Docker
- **To:** **Nixpacks** (or "Auto-detect")

**Build Command:**
```bash
pip install --no-cache-dir -r requirements_koyeb.txt && cd movie2book && npm ci
```

**Start Command:**
```bash
sh start.sh
```

**Port:**
```
3000
```

### Step 2: Push Files to GitHub

Make sure these are in your repo:
- ✅ `nixpacks.toml` (I created it)
- ✅ `requirements_koyeb.txt` (I created it - optimized)
- ✅ `start.sh` (already exists)

```bash
git add nixpacks.toml requirements_koyeb.txt .dockerignore
git commit -m "Add Koyeb build configuration"
git push
```

### Step 3: Redeploy

- Click "Redeploy" in Koyeb
- Or push to GitHub (auto-deploys)

---

## Why This Works

**Nixpacks:**
- ✅ Faster than Docker
- ✅ Auto-detects Python + Node.js
- ✅ Handles FFmpeg automatically
- ✅ Less configuration

**Optimized Build:**
- ✅ `--no-cache-dir` - Faster pip installs
- ✅ `npm ci` - Faster than `npm install`
- ✅ Combined requirements file - One install step

---

## If Still Fails

### Check Build Logs:
1. Go to Koyeb Dashboard
2. Your app → Logs
3. Look for what's taking long

### Common Issues:

**"Installing opencv-python..." takes forever:**
- Solution: Already using `opencv-python-headless` in `requirements_koyeb.txt` ✅

**"npm install" takes forever:**
- Solution: Using `npm ci` (faster) ✅

**Build times out:**
- Solution: Using `--no-cache-dir` (faster) ✅

---

## Alternative: Remove Dockerfile

If Koyeb keeps trying Docker:

**Option 1: Delete Dockerfile**
```bash
git rm Dockerfile
git commit -m "Remove Dockerfile for Koyeb"
git push
```

**Option 2: Rename it**
```bash
git mv Dockerfile Dockerfile.flyio
git commit -m "Rename Dockerfile for Fly.io"
git push
```

This tells Koyeb to use Nixpacks instead.

---

## Recommended Settings

**In Koyeb Dashboard:**

**Builder:** Nixpacks  
**Build Command:** `pip install --no-cache-dir -r requirements_koyeb.txt && cd movie2book && npm ci`  
**Start Command:** `sh start.sh`  
**Port:** `3000`

**Environment Variables:** (Set all as before)

---

## Test

After redeploying:
1. ✅ Check build logs - should be faster
2. ✅ Check app starts - both services running
3. ✅ Test upload - end-to-end

---

## Summary

**The fix:**
1. ✅ Change builder to Nixpacks
2. ✅ Use optimized build command
3. ✅ Remove/rename Dockerfile (optional)
4. ✅ Redeploy

**Should fix the timeout!** 🎉
