# Render Cache Fix (No Clear Cache Button) 🔧

## Problem
Docker cache corruption error, but Render doesn't have a "Clear build cache" button.

## Solution 1: Force Rebuild with RUN Command (Already Applied)

The Dockerfile now includes a `RUN` command that creates a timestamp file. This forces Docker to invalidate the cache layer.

**Status:** ✅ Already applied - just push and redeploy

## Solution 2: Manual Cache Invalidation

If Solution 1 doesn't work, try these:

### Option A: Change Build Command Temporarily

1. Render Dashboard → Your Service → Settings
2. Under **"Build Command"**, change to:
   ```bash
   docker build --no-cache -t app .
   ```
3. Save and trigger a deploy
4. After successful build, remove the custom build command (revert to default)

### Option B: Add a Dummy File

1. Create an empty file: `touch .cache-bust`
2. Add it to git: `git add .cache-bust && git commit -m "Cache bust" && git push`
3. This changes the build context and forces rebuild

### Option C: Modify Dockerfile Order

Temporarily reorder COPY commands in Dockerfile to break cache:
```dockerfile
# Temporarily change order to break cache
COPY movie2book/postcss.config.mjs movie2book/
COPY movie2book/tsconfig.json movie2book/
COPY movie2book/next.config.ts movie2book/
COPY movie2book/middleware.ts movie2book/
COPY movie2book/public movie2book/public
COPY movie2book/lib movie2book/lib
COPY movie2book/app movie2book/app
COPY movie2book/package.json movie2book/package-lock.json movie2book/
```

### Option D: Contact Render Support

If none of the above work:
1. Go to Render Dashboard → Support
2. Ask them to clear build cache for your service
3. They can do it from their end

## Current Status

✅ Dockerfile updated with cache-busting RUN command
✅ Ready to deploy - should force cache invalidation

## Why This Works

The `RUN` command creates a new layer that changes every build, forcing Docker to rebuild subsequent layers even if files haven't changed.
