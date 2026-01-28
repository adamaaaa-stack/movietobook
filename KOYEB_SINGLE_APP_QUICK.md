# Koyeb Single App - Quick Setup ✅

## You're All Set! Here's What I Updated:

### ✅ Created Files:
1. `start.sh` - Runs both Python backend + Next.js frontend
2. `KOYEB_SINGLE_APP.md` - Complete guide

### ✅ Updated Files:
1. `app/upload/page.tsx` - Now uses `/api/upload-replit`
2. `app/processing/page.tsx` - Now uses `/api/status-external`
3. `app/result/page.tsx` - Now uses `/api/result-external`
4. `app/api/upload-replit/route.ts` - Defaults to `localhost:8080`
5. `app/api/status-external/route.ts` - Defaults to `localhost:8080`
6. `app/api/result-external/route.ts` - Defaults to `localhost:8080`

---

## Koyeb Configuration

### Build Command:
```bash
cd movie2book && npm install && cd .. && pip install -r requirements.txt && pip install flask flask-cors gunicorn
```

### Start Command:
```bash
sh start.sh
```

### Port:
```
3000
```

### Environment Variables (Set in Koyeb Dashboard):
```
OPENAI_API_KEY=your_key
PORT=8080
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_id
LEMONSQUEEZY_VARIANT_ID=your_id
EXTERNAL_API_URL=http://localhost:8080
PORT=3000
```

---

## How It Works

1. **Koyeb starts** → Runs `start.sh`
2. **`start.sh` starts:**
   - Python API on port 8080 (background)
   - Next.js on port 3000 (foreground)
3. **Frontend calls backend** via `http://localhost:8080`
4. **Everything works!** 🎉

---

## Next Steps

1. ✅ Push `start.sh` to GitHub
2. ✅ Configure Koyeb (build/start commands above)
3. ✅ Set environment variables in Koyeb
4. ✅ Deploy!
5. ✅ Test upload

---

## Test It

1. **Visit your Koyeb URL**
2. **Upload a video**
3. **Check logs** in Koyeb dashboard
4. **Should work!** 🚀

Everything is configured for single app deployment!
