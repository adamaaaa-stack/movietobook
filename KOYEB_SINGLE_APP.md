# Koyeb Single App Setup - Complete Guide 🚀

## You're Running Everything in One Koyeb App - Here's How!

---

## Architecture

```
Single Koyeb App
├── Python Backend (api_server.py) → Port 8080
└── Next.js Frontend (movie2book/) → Port 3000
```

**Both run together, frontend calls backend via `localhost:8080`**

---

## Required Files

### 1. `start.sh` (Startup Script)
✅ **Created!** This runs both services.

### 2. Koyeb Configuration

**In Koyeb Dashboard:**

**Build Command:**
```bash
cd movie2book && npm install && cd .. && pip install -r requirements.txt && pip install flask flask-cors gunicorn
```

**Start Command:**
```bash
sh start.sh
```

**Port:**
```
3000
```
(Koyeb will expose port 3000, which is your Next.js frontend)

---

## Environment Variables

**Set ALL of these in Koyeb Dashboard → Variables:**

```
# Backend
OPENAI_API_KEY=your_openai_key_here
PORT=8080

# Frontend
NEXT_PUBLIC_SUPABASE_URL=https://iubzlvifqarwuylbhyup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnpsdmlmcWFyd3V5bGJoeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg3NTgsImV4cCI6MjA4NTEwNDc1OH0.HhRAWPj0UW_ij2EBH625baOXJjG1ZoAUSUQuswxmdH8
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_id
LEMONSQUEEZY_VARIANT_ID=your_id
EXTERNAL_API_URL=http://localhost:8080
PORT=3000
```

**Important:** `EXTERNAL_API_URL=http://localhost:8080` - Frontend calls backend on localhost!

---

## Update API Routes

Your frontend needs to call the backend. You have two options:

### Option 1: Use External Routes (Easiest)

I've created these routes that call the backend:
- `/api/upload-replit` → Calls `http://localhost:8080/api/process-video`
- `/api/status-external` → Calls backend
- `/api/result-external` → Calls backend

**Update `app/upload/page.tsx`:**
Change line 119 from:
```typescript
xhr.open('POST', '/api/upload');
```
To:
```typescript
xhr.open('POST', '/api/upload-replit');
```

### Option 2: Update Existing Routes

Modify `app/api/upload/route.ts` to forward to backend instead of spawning Python.

---

## File Structure in Koyeb

Your repo should have:
```
/
├── start.sh                    ← Startup script (NEW!)
├── api_server.py              ← Python backend
├── video_to_narrative.py      ← Python script
├── requirements.txt           ← Python dependencies
├── requirements_api.txt       ← API dependencies
│
└── movie2book/                ← Next.js frontend
    ├── app/
    ├── package.json
    └── ...
```

---

## Step-by-Step Koyeb Setup

### 1. Push Files to GitHub
Make sure `start.sh` is in your repo:
```bash
git add start.sh
git commit -m "Add Koyeb startup script"
git push
```

### 2. In Koyeb Dashboard

**Go to your app → Settings:**

**Build:**
- Build Command: `cd movie2book && npm install && cd .. && pip install -r requirements.txt && pip install flask flask-cors gunicorn`

**Run:**
- Start Command: `sh start.sh`
- Port: `3000`

**Variables:**
- Add all environment variables listed above

### 3. Deploy
- Click "Redeploy" or push to GitHub (auto-deploys)

---

## How It Works

1. **Koyeb starts your app**
2. **`start.sh` runs:**
   - Starts Python API on port 8080 (background)
   - Starts Next.js on port 3000 (foreground)
3. **Koyeb exposes port 3000** (your frontend)
4. **Frontend calls backend** via `http://localhost:8080`
5. **Both services run in same container**

---

## Testing

### 1. Check Backend Health:
```bash
# From inside Koyeb (or via SSH if available)
curl http://localhost:8080/health
```

### 2. Check Frontend:
- Visit your Koyeb app URL
- Should see homepage

### 3. Test Upload:
- Upload a small video
- Check Koyeb logs for both services
- Verify backend receives request

### 4. Check Logs:
- Koyeb Dashboard → Your App → Logs
- Should see logs from both Python and Next.js

---

## Troubleshooting

### Both services won't start:
- ✅ Check `start.sh` is executable: `chmod +x start.sh`
- ✅ Verify both `api_server.py` and `movie2book/` exist
- ✅ Check build logs for errors

### Frontend can't reach backend:
- ✅ Verify `EXTERNAL_API_URL=http://localhost:8080`
- ✅ Check backend is running (check logs)
- ✅ Verify port 8080 is not blocked

### Port conflicts:
- ✅ Backend: Port 8080
- ✅ Frontend: Port 3000
- ✅ Koyeb exposes: Port 3000

### Memory issues:
- ✅ Free tier (512MB) might be tight
- ✅ Process one video at a time
- ✅ Monitor Koyeb metrics

### Build fails:
- ✅ Check all dependencies in `requirements.txt`
- ✅ Verify `package.json` has all deps
- ✅ Check build logs for specific errors

---

## Quick Checklist

**Before Deploying:**
- [ ] `start.sh` exists and is executable
- [ ] All files pushed to GitHub
- [ ] Environment variables set in Koyeb
- [ ] Build command configured
- [ ] Start command: `sh start.sh`
- [ ] Port: `3000`

**After Deploying:**
- [ ] Check logs - both services starting?
- [ ] Test frontend URL loads
- [ ] Test backend health endpoint
- [ ] Test video upload
- [ ] Monitor for errors

---

## Alternative: Use PM2 (More Robust)

If `start.sh` doesn't work, use PM2:

**Create `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'api_server.py',
      interpreter: 'python3',
      env: {
        PORT: 8080
      }
    },
    {
      name: 'frontend',
      cwd: './movie2book',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: 3000
      }
    }
  ]
};
```

**Install PM2:**
```bash
npm install -g pm2
```

**Start Command:**
```bash
pm2 start ecosystem.config.js && pm2 logs
```

---

## Summary

**Single App Setup:**
- ✅ Both services in one Koyeb app
- ✅ `start.sh` runs both
- ✅ Frontend calls backend via `localhost:8080`
- ✅ Koyeb exposes port 3000 (frontend)

**Next Steps:**
1. ✅ Push `start.sh` to GitHub
2. ✅ Configure Koyeb (build/start commands)
3. ✅ Set environment variables
4. ✅ Update frontend to use external routes
5. ✅ Deploy and test!

Let me know if you need help with any step! 🚀
