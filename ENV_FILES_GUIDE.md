# Environment Files Guide 📝

## Quick Answer

**For Local Development:**
- ✅ `.env` - Python backend (root directory)
- ✅ `.env.local` - Next.js frontend (`movie2book/` directory)

**For Deployment:**
- ❌ **Don't upload .env files!** Use platform's environment variables instead

---

## File Locations & Purpose

### 1. Root `.env` (Python Backend)
**Location:** `/Users/oogy/Documents/movietobook/.env`

**Used by:**
- `video_to_narrative.py`
- `api_server.py`

**Contains:**
```
OPENAI_API_KEY=your_key
```

**Should be gitignored:** ✅ Yes (already in `.gitignore`)

---

### 2. Frontend `.env.local` (Next.js)
**Location:** `/Users/oogy/Documents/movietobook/movie2book/.env.local`

**Used by:**
- Next.js app (Vercel frontend)
- All `app/` routes
- All components

**Contains:**
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_id
LEMONSQUEEZY_VARIANT_ID=your_id
EXTERNAL_API_URL=https://your-backend.koyeb.app
```

**Should be gitignored:** ✅ Yes (already in `.gitignore`)

---

## What You Need

### Local Development:
1. ✅ `.env` in root (for Python)
2. ✅ `.env.local` in `movie2book/` (for Next.js)

### Deployment:
**Don't upload .env files!** Set environment variables in each platform:

**Vercel (Frontend):**
- Go to Settings → Environment Variables
- Add all `NEXT_PUBLIC_*` and other vars
- Never commit `.env.local` to git

**Koyeb/Render/Railway (Backend):**
- Go to Environment Variables in dashboard
- Add `OPENAI_API_KEY` and other vars
- Never commit `.env` to git

---

## File Structure

```
movietobook/
├── .env                    ← Python backend (gitignored ✅)
├── video_to_narrative.py   ← Uses .env
├── api_server.py           ← Uses .env
│
└── movie2book/
    ├── .env.local          ← Next.js frontend (gitignored ✅)
    ├── app/
    └── package.json
```

---

## Important Rules

### ✅ DO:
- Use `.env` for Python (root)
- Use `.env.local` for Next.js (`movie2book/`)
- Keep both files gitignored
- Set env vars in deployment platforms (Vercel, Koyeb, etc.)

### ❌ DON'T:
- Commit `.env` or `.env.local` to git
- Upload `.env` files to deployment platforms
- Use `.env` for Next.js (use `.env.local` instead)
- Share `.env` files publicly

---

## For Deployment Platforms

### Vercel (Frontend):
**Set in Dashboard:**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
LEMONSQUEEZY_API_KEY=...
EXTERNAL_API_URL=...
```

**Don't upload:** `.env.local` file

---

### Koyeb/Render/Railway (Backend):
**Set in Dashboard:**
```
OPENAI_API_KEY=...
PORT=8080
```

**Don't upload:** `.env` file

---

## Quick Checklist

**Local Development:**
- [ ] `.env` exists in root (Python)
- [ ] `.env.local` exists in `movie2book/` (Next.js)
- [ ] Both are in `.gitignore` ✅

**Deployment:**
- [ ] Vercel: Set env vars in dashboard (not file)
- [ ] Koyeb/Render: Set env vars in dashboard (not file)
- [ ] Never commit `.env` files ✅

---

## Summary

**You need BOTH for local development:**
- ✅ `.env` (root) - Python backend
- ✅ `.env.local` (movie2book/) - Next.js frontend

**For deployment:**
- ❌ Don't upload files
- ✅ Set vars in platform dashboards

**Both files should be gitignored** (they already are!)
