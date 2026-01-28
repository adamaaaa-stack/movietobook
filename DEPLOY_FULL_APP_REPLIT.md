# Deploy Entire App on Replit - Complete Guide 🎉

## Simplest Approach: Two Separate Repls

**Why two repls?**
- ✅ Easier to manage
- ✅ Each can run independently
- ✅ Clear separation
- ✅ Both free!

---

## Part 1: Frontend Repl (Next.js)

### Step 1: Create Frontend Repl
1. Go to https://replit.com
2. Click "Create Repl"
3. Choose **"Node.js"** template
4. Name: `movietobook-frontend`
5. Click "Create Repl"

### Step 2: Copy Frontend Files
Copy these files/folders from `movie2book/` to your repl:

**Required:**
- `app/` (entire folder)
- `lib/` (entire folder)
- `public/` (entire folder)
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts` (if exists)
- `postcss.config.mjs` (if exists)
- `middleware.ts`
- `.env.local.example` (rename to `.env.local`)

**Copy method:**
- In Replit, click "Files" tab
- Click "Upload file" or drag & drop
- Upload entire folders

### Step 3: Install Dependencies
In Replit Shell:
```bash
npm install
```

### Step 4: Set Environment Variables
Click "Secrets" tab, add:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
LEMONSQUEEZY_API_KEY=your_key
LEMONSQUEEZY_STORE_ID=your_id
LEMONSQUEEZY_VARIANT_ID=your_id
EXTERNAL_API_URL=https://movietobook-backend.yourname.repl.co
```

### Step 5: Update API Routes
Update these files to use external API:

**`app/api/upload/route.ts`:**
Change to call `EXTERNAL_API_URL` instead of running Python locally.

**Or use the external routes I created:**
- Use `/api/upload-railway` instead of `/api/upload`
- Use `/api/status-external` instead of `/api/status`
- Use `/api/result-external` instead of `/api/result`

### Step 6: Run Frontend
Click "Run" button
- Should start on port 3000
- Get URL from "Webview" tab

---

## Part 2: Backend Repl (Python API)

### Step 1: Create Backend Repl
1. Go to https://replit.com
2. Click "Create Repl"
3. Choose **"Python"** template
4. Name: `movietobook-backend`
5. Click "Create Repl"

### Step 2: Copy Backend Files
Copy these files:

**Files to copy:**
1. `replit_main.py` → Paste as `main.py`
2. `video_to_narrative.py` → Copy as-is
3. `replit_requirements.txt` → Paste as `requirements.txt`
4. `.replit` → Copy as-is (optional)

### Step 3: Install Dependencies
In Replit Shell:
```bash
# Install Python packages
pip install -r requirements.txt

# Install FFmpeg
pkg install ffmpeg
```

### Step 4: Set Environment Variables
Click "Secrets" tab, add:
```
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_SUPABASE_URL=your_url (if needed)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key (if needed)
```

### Step 5: Run Backend
Click "Run" button
- Should start on port 8080
- Get URL from "Webview" tab
- Test: `https://movietobook-backend.yourname.repl.co/health`

---

## Part 3: Connect Them

### Update Frontend to Use Backend

In frontend repl, make sure `EXTERNAL_API_URL` in Secrets points to backend URL:
```
EXTERNAL_API_URL=https://movietobook-backend.yourname.repl.co
```

### Update API Routes (if needed)

If you want to use the external routes I created:
- Frontend calls `/api/upload-railway` → This calls backend
- Frontend calls `/api/status-external` → This calls backend
- Frontend calls `/api/result-external` → This calls backend

**Or update existing routes:**
- Modify `app/api/upload/route.ts` to forward to backend
- Modify `app/api/status/route.ts` to call backend
- Modify `app/api/result/route.ts` to call backend

---

## Quick Start (Copy/Paste Method)

### Frontend Repl:
1. Create Node.js repl
2. Upload `movie2book/` folder
3. Run: `npm install`
4. Set secrets
5. Run: `npm run dev`

### Backend Repl:
1. Create Python repl
2. Copy `replit_main.py` → `main.py`
3. Copy `video_to_narrative.py`
4. Copy `replit_requirements.txt` → `requirements.txt`
5. Run: `pkg install ffmpeg`
6. Run: `pip install -r requirements.txt`
7. Set secrets
8. Run: `python main.py`

### Connect:
- Frontend URL: `https://movietobook-frontend.yourname.repl.co`
- Backend URL: `https://movietobook-backend.yourname.repl.co`
- Set `EXTERNAL_API_URL` in frontend secrets

---

## Cost: $0/month ✅

**Two free repls:**
- Frontend repl: Free ✅
- Backend repl: Free ✅
- **Total: $0/month** 🎉

---

## Troubleshooting

### Frontend won't start:
- Check `package.json` has all dependencies
- Run `npm install` again
- Check for TypeScript errors

### Backend won't start:
- Check FFmpeg installed: `pkg install ffmpeg`
- Check Python packages: `pip install -r requirements.txt`
- Check secrets are set

### Can't connect frontend to backend:
- Verify backend URL is correct
- Check CORS is enabled (it is in `replit_main.py`)
- Test backend `/health` endpoint first

### Port conflicts:
- Replit handles ports automatically
- Use environment variables for URLs
- Don't hardcode ports

---

## Alternative: Single Repl (Advanced)

If you want everything in one repl:

1. Create **Node.js** repl
2. Copy frontend files
3. Add Python files
4. Create `start.sh`:
   ```bash
   python3 api_server.py &
   npm run dev
   ```
5. Set `.replit` to run `start.sh`

**But two repls is easier!** ⭐

---

## Next Steps

1. ✅ Create frontend repl
2. ✅ Create backend repl  
3. ✅ Connect them
4. ✅ Test end-to-end
5. ✅ Share your app!

**Total time: ~10 minutes**  
**Total cost: $0**  
**Total complexity: Easy** 🚀
