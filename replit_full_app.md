# Deploy Entire App on Replit 🚀

## Deploy Both Frontend (Next.js) + Backend (Python) on Replit

Replit can run both! Here's how:

---

## Option 1: Single Repl with Both (Recommended)

### Step 1: Create Repl
1. Go to https://replit.com
2. Create new repl
3. Choose **"Node.js"** template (we'll add Python too)
4. Name: `movietobook-full`

### Step 2: Copy Next.js App
1. Copy entire `movie2book/` folder contents to Replit
2. All files should be in root of repl

### Step 3: Add Python Backend
1. Copy `video_to_narrative.py` to repl root
2. Copy `requirements.txt` to repl root
3. Copy `api_server.py` (or use `replit_main.py`)

### Step 4: Create Startup Script
Create `start.sh`:
```bash
#!/bin/bash
# Start Python API server in background
python3 api_server.py &
# Start Next.js frontend
npm run dev
```

### Step 5: Install Everything
In Shell:
```bash
# Install Node dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
pip install flask flask-cors gunicorn

# Install FFmpeg
pkg install ffmpeg
```

### Step 6: Set Secrets
Add all environment variables in Secrets tab

### Step 7: Run!
Click "Run" - both servers start!

---

## Option 2: Two Separate Repls (Easier)

### Repl 1: Frontend (Next.js)
1. Create **Node.js** repl
2. Copy `movie2book/` folder
3. Run: `npm install && npm run dev`
4. Get URL: `https://frontend.yourname.repl.co`

### Repl 2: Backend (Python API)
1. Create **Python** repl
2. Copy `replit_main.py` → `main.py`
3. Copy `video_to_narrative.py`
4. Copy `replit_requirements.txt` → `requirements.txt`
5. Run: `python main.py`
6. Get URL: `https://backend.yourname.repl.co`

### Connect Them
In frontend repl, set:
```
NEXT_PUBLIC_API_URL=https://backend.yourname.repl.co
```

---

## Option 3: Use Replit's Multi-Language Support

Replit supports running multiple processes!

### Create `.replit` file:
```toml
run = "sh start.sh"
entrypoint = "start.sh"

[deploy]
run = ["sh", "-c", "npm run build && npm start"]
```

### Create `start.sh`:
```bash
#!/bin/bash
# Start Python API
python3 api_server.py &
# Start Next.js
npm run dev
```

---

## Recommended: Option 2 (Two Repls)

**Why:**
- ✅ Easier to manage
- ✅ Can scale independently
- ✅ Clear separation
- ✅ Both free!

**Cost:** $0/month (2 free repls)

---

## Quick Setup: Two Repls

### Frontend Repl (5 minutes):
1. Create Node.js repl → `movietobook-frontend`
2. Copy `movie2book/` folder contents
3. Run: `npm install`
4. Set secrets (Supabase, Lemon Squeezy)
5. Run: `npm run dev`
6. Get URL

### Backend Repl (3 minutes):
1. Create Python repl → `movietobook-backend`
2. Copy files from `replit_main.py` setup
3. Install FFmpeg: `pkg install ffmpeg`
4. Set secrets (OpenAI API key)
5. Run: `python main.py`
6. Get URL

### Connect:
In frontend, update API calls to use backend URL!

---

## Files Needed

I'll create a complete setup guide with all files ready to copy!
