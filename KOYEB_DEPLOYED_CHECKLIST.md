# Koyeb Deployment Checklist ✅

## You've Deployed on Koyeb - Let's Verify Everything!

---

## Quick Questions

**Did you deploy:**
- [ ] Single app (both frontend + backend together)?
- [ ] Two apps (frontend separate, backend separate)?

**This determines your setup!**

---

## If Single App (Everything Together)

### Configuration Needed:

**1. Create `start.sh` in root:**
```bash
#!/bin/bash
# Start Python API backend
python3 api_server.py &
# Start Next.js frontend  
cd movie2book
npm run dev
```

**2. In Koyeb Dashboard:**
- **Build Command:** `cd movie2book && npm install && cd .. && pip install -r requirements.txt`
- **Start Command:** `sh start.sh`
- **Port:** 3000 (frontend)

**3. Environment Variables (all in one app):**
```
# Backend
OPENAI_API_KEY=your_key
PORT=8080

# Frontend
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_id
LEMONSQUEEZY_VARIANT_ID=your_id
EXTERNAL_API_URL=http://localhost:8080
```

---

## If Two Apps (Separate)

### Frontend App:

**Build Command:**
```
cd movie2book && npm install
```

**Start Command:**
```
cd movie2book && npm run dev
```

**Port:** 3000

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_id
LEMONSQUEEZY_VARIANT_ID=your_id
EXTERNAL_API_URL=https://your-backend-app.koyeb.app
PORT=3000
```

### Backend App:

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
python api_server.py
```

**Port:** 8080

**Environment Variables:**
```
OPENAI_API_KEY=your_key
PORT=8080
```

---

## Critical: Update API Routes!

Your Next.js app currently tries to run Python locally. You need to update it to call your Koyeb backend!

### Option 1: Use External Routes (Easiest)

I've already created these routes:
- `/api/upload-replit` → Calls external API
- `/api/status-external` → Calls external API  
- `/api/result-external` → Calls external API

**Update your frontend to use these instead!**

### Option 2: Update Existing Routes

Modify `app/api/upload/route.ts` to forward to backend:

```typescript
// Instead of spawning Python, forward to backend
const backendUrl = process.env.EXTERNAL_API_URL || 'http://localhost:8080';
const response = await fetch(`${backendUrl}/api/process-video`, {
  method: 'POST',
  body: formData,
});
```

---

## Testing Checklist

### 1. Test Backend Health:
```bash
curl https://your-backend-app.koyeb.app/health
# Should return: {"status":"ok"}
```

### 2. Test Frontend:
- Visit: `https://your-frontend-app.koyeb.app`
- Should load homepage

### 3. Test Upload:
- Try uploading a small video
- Check Koyeb logs for errors
- Verify backend receives request

### 4. Check Logs:
- Go to Koyeb Dashboard → Your App → Logs
- Look for errors or issues

---

## Common Issues & Fixes

### Issue: Frontend can't reach backend
**Fix:**
- Check `EXTERNAL_API_URL` is set correctly
- For single app: Use `http://localhost:8080`
- For two apps: Use backend's Koyeb URL

### Issue: Port conflicts
**Fix:**
- Frontend: Port 3000
- Backend: Port 8080
- Set `PORT` env var correctly

### Issue: Build fails
**Fix:**
- Check build logs in Koyeb
- Verify all files are in repo
- Check dependencies in `package.json` and `requirements.txt`

### Issue: Memory errors
**Fix:**
- Free tier (512MB) might be tight
- Process one video at a time
- Consider upgrading

---

## What You Need to Do Now

1. ✅ **Determine setup:** Single app or two apps?
2. ✅ **Set environment variables** in Koyeb dashboard
3. ✅ **Update API routes** to call backend (or use external routes)
4. ✅ **Test everything** end-to-end
5. ✅ **Monitor logs** for errors

---

## Quick Fix: Use External Routes

**Easiest solution:** Update your frontend to use the external API routes I created:

**In `app/upload/page.tsx`:**
Change API calls from `/api/upload` to `/api/upload-replit`

**Or update the routes to automatically use backend if `EXTERNAL_API_URL` is set.**

---

## Need Help?

**Tell me:**
1. Single app or two apps?
2. What errors are you seeing?
3. What's your Koyeb app URL(s)?

I can help troubleshoot! 🚀
