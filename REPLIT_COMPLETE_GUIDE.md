# Complete Guide: Deploy Full App on Replit 🚀

## Two Repls = Easiest Setup

Deploy frontend and backend separately - both free!

---

## 🎯 Frontend Repl (Next.js)

### Files to Copy:
From `movie2book/` folder, copy everything:
- `app/` folder
- `lib/` folder  
- `public/` folder
- `package.json`
- `next.config.ts`
- `tsconfig.json`
- All config files

### Steps:
1. Create **Node.js** repl → `movietobook-frontend`
2. Upload all files
3. Run: `npm install`
4. Set secrets (see below)
5. Run: `npm run dev`
6. Get URL: `https://movietobook-frontend.yourname.repl.co`

---

## 🔧 Backend Repl (Python)

### Files to Copy:
- `replit_main.py` → `main.py`
- `video_to_narrative.py`
- `replit_requirements.txt` → `requirements.txt`

### Steps:
1. Create **Python** repl → `movietobook-backend`
2. Copy files above
3. Run: `pkg install ffmpeg`
4. Run: `pip install -r requirements.txt`
5. Set secrets (see below)
6. Run: `python main.py`
7. Get URL: `https://movietobook-backend.yourname.repl.co`

---

## 🔗 Connect Them

### Frontend Secrets:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_id
LEMONSQUEEZY_VARIANT_ID=your_id
EXTERNAL_API_URL=https://movietobook-backend.yourname.repl.co
```

### Backend Secrets:
```
OPENAI_API_KEY=your_key
```

---

## 📝 Update Frontend Routes

Use the external API routes I created:
- `/api/upload-replit` (instead of `/api/upload`)
- `/api/status-external` (instead of `/api/status`)
- `/api/result-external` (instead of `/api/result`)

**Or** update existing routes to call backend URL.

---

## ✅ That's It!

**Frontend:** `https://movietobook-frontend.yourname.repl.co`  
**Backend:** `https://movietobook-backend.yourname.repl.co`  
**Cost:** $0/month 🎉

---

## Quick Checklist

- [ ] Create frontend repl (Node.js)
- [ ] Upload frontend files
- [ ] Install: `npm install`
- [ ] Set frontend secrets
- [ ] Create backend repl (Python)
- [ ] Copy backend files
- [ ] Install FFmpeg: `pkg install ffmpeg`
- [ ] Install Python packages: `pip install -r requirements.txt`
- [ ] Set backend secrets
- [ ] Connect frontend to backend URL
- [ ] Test!

**Total time: ~10 minutes** ⏱️
