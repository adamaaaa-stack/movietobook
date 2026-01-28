# Koyeb Full App Setup Guide 🚀

## You Deployed Everything on Koyeb - Here's What You Need!

---

## Architecture Options

### Option 1: Single Koyeb App (Both Frontend + Backend)
**If you deployed everything in one Koyeb app:**

You'll need to run both services together:
- Next.js frontend (port 3000)
- Python API backend (port 8080)

### Option 2: Two Koyeb Apps (Recommended)
**If you deployed separately:**
- Frontend app: Next.js
- Backend app: Python API

---

## Configuration Needed

### For Single App (Both Services):

**Create `start.sh`:**
```bash
#!/bin/bash
# Start Python API in background
python3 api_server.py &
# Start Next.js frontend
cd movie2book
npm run dev
```

**Update Koyeb:**
- Build command: `cd movie2book && npm install && pip install -r requirements.txt`
- Start command: `sh start.sh`

---

### For Two Apps (Separate):

**Frontend App:**
- Build: `cd movie2book && npm install`
- Start: `cd movie2book && npm run dev`
- Port: 3000

**Backend App:**
- Build: `pip install -r requirements.txt`
- Start: `python api_server.py`
- Port: 8080

**Connect them:**
- Frontend env var: `EXTERNAL_API_URL=https://your-backend-app.koyeb.app`

---

## Environment Variables Needed

### Frontend App (Next.js):
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_id
LEMONSQUEEZY_VARIANT_ID=your_id
EXTERNAL_API_URL=https://your-backend-app.koyeb.app
PORT=3000
```

### Backend App (Python):
```
OPENAI_API_KEY=your_key
PORT=8080
```

---

## Important: Update API Routes

Your Next.js app needs to call the backend. Update these:

**Option A: Use External Routes (Easiest)**
- Use `/api/upload-replit` instead of `/api/upload`
- Use `/api/status-external` instead of `/api/status`
- Use `/api/result-external` instead of `/api/result`

**Option B: Update Existing Routes**
- Modify `app/api/upload/route.ts` to call `EXTERNAL_API_URL`
- Modify `app/api/status/route.ts` to call backend
- Modify `app/api/result/route.ts` to call backend

---

## Quick Checklist

**Single App Setup:**
- [ ] Created `start.sh` script
- [ ] Set build command in Koyeb
- [ ] Set start command in Koyeb
- [ ] Added all environment variables
- [ ] Updated API routes to use backend

**Two Apps Setup:**
- [ ] Frontend app deployed
- [ ] Backend app deployed
- [ ] Frontend has `EXTERNAL_API_URL` set
- [ ] Both apps have correct env vars
- [ ] Tested connection between apps

---

## Testing

### Test Backend:
```bash
curl https://your-backend-app.koyeb.app/health
# Should return: {"status":"ok"}
```

### Test Frontend:
```bash
# Visit your frontend URL
https://your-frontend-app.koyeb.app
```

### Test Connection:
- Upload a video from frontend
- Check if it calls backend API
- Monitor logs in Koyeb dashboard

---

## Troubleshooting

### Frontend can't reach backend:
- ✅ Check `EXTERNAL_API_URL` is set correctly
- ✅ Verify backend URL is correct
- ✅ Check CORS is enabled in `api_server.py` (it is!)
- ✅ Test backend `/health` endpoint directly

### Both services won't start:
- ✅ Check build logs in Koyeb
- ✅ Verify all dependencies installed
- ✅ Check port conflicts (use different ports)
- ✅ Review Koyeb logs for errors

### Memory issues:
- ✅ Free tier (512MB) might be tight
- ✅ Consider upgrading or optimizing
- ✅ Process one video at a time

---

## Next Steps

1. ✅ Verify your setup (single app or two apps?)
2. ✅ Check environment variables are set
3. ✅ Test backend health endpoint
4. ✅ Test frontend loads
5. ✅ Test video upload end-to-end
6. ✅ Monitor Koyeb logs for errors

---

## Need Help?

**Common Issues:**
- Port conflicts → Use different ports
- Memory errors → Upgrade or optimize
- Connection issues → Check `EXTERNAL_API_URL`
- Build failures → Check logs, verify dependencies

**Check Koyeb Dashboard:**
- Logs tab → See real-time logs
- Metrics tab → Monitor CPU/RAM usage
- Variables tab → Verify env vars set

---

## Summary

**You've deployed on Koyeb - great!** 🎉

Now make sure:
1. ✅ Environment variables are set
2. ✅ Frontend can reach backend
3. ✅ Both services are running
4. ✅ Test end-to-end flow

Let me know what setup you used (single app or two apps) and I can help troubleshoot!
