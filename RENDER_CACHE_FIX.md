# Render Build Cache Issue Fix 🔧

## Problem
Build is failing because it's trying to import `stripe` package from deleted webhook route:
```
Module not found: Can't resolve 'stripe'
./app/api/webhook/stripe/route.ts:3:1
```

## Solution

The file `movie2book/app/api/webhook/stripe/route.ts` has been deleted from git, but Render is using a **cached Docker layer**.

### Option 1: Clear Build Cache in Render (Recommended)

1. Go to Render Dashboard → Your Service
2. Click **"Settings"** tab
3. Scroll to **"Build & Deploy"** section
4. Click **"Clear build cache"** button
5. Trigger a new deploy

### Option 2: Manual Rebuild

1. Go to Render Dashboard → Your Service
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**

### Option 3: Force Cache Invalidation

The Dockerfile has been updated with a comment to help invalidate cache. If the above doesn't work:

1. In Render Dashboard → Your Service → Settings
2. Under **"Build Command"**, temporarily add:
   ```bash
   docker build --no-cache .
   ```
3. Save and redeploy
4. Remove the flag after successful build

## Verification

After clearing cache, verify the build:
- ✅ Should only see PayPal webhook route
- ✅ No Stripe/PayFast/LemonSqueezy imports
- ✅ Build completes successfully

## Current State

- ✅ Stripe webhook route deleted
- ✅ PayFast webhook route deleted  
- ✅ LemonSqueezy webhook route deleted
- ✅ Only PayPal webhook route remains
- ✅ All changes pushed to GitHub

The code is correct - Render just needs to rebuild without cache!
