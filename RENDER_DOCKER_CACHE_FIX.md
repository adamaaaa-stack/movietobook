# Render Docker Cache Error Fix 🔧

## Error
```
error: failed to solve: failed to compute cache key: failed commit on ref "layer-sha256:...": unexpected commit digest
```

## Solution

This is a Docker build cache corruption issue. Here's how to fix it:

### Option 1: Clear Build Cache in Render (Recommended)

1. Go to **Render Dashboard** → Your Service
2. Click **"Settings"** tab
3. Scroll to **"Build & Deploy"** section
4. Click **"Clear build cache"** button
5. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Option 2: Force Rebuild Without Cache

If Option 1 doesn't work:

1. In Render Dashboard → Your Service → Settings
2. Under **"Build Command"**, temporarily change to:
   ```bash
   docker build --no-cache -t app .
   ```
3. Save and redeploy
4. After successful build, revert the build command

### Option 3: Update Dockerfile (Already Done)

The Dockerfile has been updated with a cache-busting comment. This should help, but you may still need to clear the cache in Render.

### Option 4: Manual Docker Build (For Testing)

If testing locally:
```bash
docker build --no-cache -t movietobook .
```

## Why This Happens

- Docker layer cache gets corrupted
- Build context changes break cache consistency
- Render's build cache can become stale

## Prevention

- Clear build cache periodically
- Use `.dockerignore` to exclude unnecessary files
- Keep Dockerfile changes minimal when possible

## Current Status

✅ Dockerfile updated with cache-busting comment
✅ Ready for rebuild after clearing cache
