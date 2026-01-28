# Deployment Architecture Options

## Recommended: Hybrid Architecture (Best Performance & Cost)

### Frontend: Vercel (Next.js)
- ✅ Fast global CDN
- ✅ Automatic deployments
- ✅ Free tier is generous
- ✅ Perfect for Next.js

### Backend API: Railway or Render (Python Processing)
- ✅ Full Python 3.11+ support
- ✅ FFmpeg pre-installed
- ✅ Easy environment variables
- ✅ Auto-deploys from GitHub
- ✅ Pay-as-you-go pricing

---

## Option 1: Railway (Recommended) ⭐

**Why Railway:**
- Easiest deployment for Python apps
- FFmpeg available via buildpacks
- $5/month starter plan (very affordable)
- Auto-deploys from GitHub
- Built-in PostgreSQL (can use instead of Supabase)

**Setup:**
1. Create account at railway.app
2. Connect GitHub repo
3. Add Python buildpack
4. Set environment variables
5. Deploy!

**Cost:** ~$5-10/month for moderate usage

---

## Option 2: Render

**Why Render:**
- Similar to Railway
- Free tier available (with limitations)
- Good Python support
- Easy setup

**Setup:**
1. Create account at render.com
2. New Web Service
3. Connect GitHub repo
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `python api_server.py` (you'll need to create this)

**Cost:** Free tier available, $7/month for better performance

---

## Option 3: Fly.io

**Why Fly.io:**
- Docker-based (more control)
- Global edge deployment
- Good for scaling
- Free tier available

**Setup:**
- Requires Dockerfile
- More complex but very flexible

**Cost:** Free tier, pay for usage

---

## Option 4: Keep Everything on Vercel (Not Recommended)

**Issues:**
- Python script won't work (no FFmpeg, no OpenCV)
- Would need to rewrite in Node.js
- Video processing is CPU-intensive (not ideal for serverless)
- Timeout limits (10min max)

**Only works if:** You rewrite the entire processing pipeline in Node.js using libraries like `fluent-ffmpeg` and `@ffmpeg/ffmpeg` (browser-based, slow)

---

## Recommended Architecture

```
┌─────────────────┐
│   Vercel       │  Next.js Frontend
│   (Frontend)   │  - Pages, UI, Auth
└────────┬────────┘
         │ HTTP API Calls
         ↓
┌─────────────────┐
│   Railway/      │  Python API Server
│   Render        │  - Video Processing
│   (Backend)     │  - FFmpeg + OpenCV
└─────────────────┘
         │
         ↓
┌─────────────────┐
│   Supabase      │  Database + Auth
│   (Database)    │  - User data
└─────────────────┘
```

---

## Implementation: Create Python API Server

You'll need to create a simple Flask/FastAPI server that wraps your Python script:

### `api_server.py` (for Railway/Render)

```python
from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)

@app.route('/api/process-video', methods=['POST'])
def process_video():
    # Get video file from request
    # Call your video_to_narrative.py script
    # Return job ID and status
    pass

@app.route('/api/status/<job_id>', methods=['GET'])
def get_status():
    # Check processing status
    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
```

Then update your Vercel API routes to call this external API instead of running Python directly.

---

## Quick Start: Railway Deployment

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize:**
   ```bash
   cd /Users/oogy/Documents/movietobook
   railway init
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Set environment variables:**
   ```bash
   railway variables set OPENAI_API_KEY=your_key
   railway variables set SUPABASE_URL=your_url
   # etc.
   ```

---

## Cost Comparison

| Service | Frontend | Backend | Total/Month |
|---------|----------|---------|-------------|
| **Vercel + Railway** | Free | $5-10 | **$5-10** ⭐ |
| **Vercel + Render** | Free | Free-$7 | **$0-7** |
| **All Vercel** | Free | ❌ Won't work | **N/A** |
| **All Railway** | $5 | $5 | **$10** |

---

## Recommendation

**Use Vercel (frontend) + Railway (backend API)**

- Best developer experience
- Easiest setup
- Most reliable
- Affordable pricing
- Scales well

Would you like me to:
1. Create the Python API server (`api_server.py`)?
2. Update the Vercel API routes to call the external API?
3. Set up Railway deployment configuration?
