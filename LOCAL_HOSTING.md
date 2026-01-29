# Host Movie2Book on Your Laptop

Run the full stack (Python backend + Next.js frontend) on your computer.

## Prerequisites

- **Python 3.11+** (with `pip`)
- **Node.js 20+** (with `npm`)
- **FFmpeg** (`brew install ffmpeg` on macOS)

## 1. One-time setup

### Backend (Python)

```bash
cd /Users/oogy/Documents/movietobook
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements_railway.txt
```

### Frontend (Next.js)

```bash
cd movie2book
npm ci
```

### Environment (frontend)

Create `movie2book/.env.local` with at least:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add PayPal vars if you want checkout: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`.

### Environment (backend, optional)

Create `.env` in the project root if you need it for `video_to_narrative.py` (e.g. `OPENAI_API_KEY`). The API server reads from the environment.

## 2. Run everything

Use **two terminals**.

### Terminal 1 – Python API (port 8080)

```bash
cd /Users/oogy/Documents/movietobook
source venv/bin/activate
gunicorn --bind 0.0.0.0:8080 --workers 1 --threads 4 --timeout 3600 api_server:app
```

Or with Flask (dev only):

```bash
PORT=8080 python3 api_server.py
```

### Terminal 2 – Next.js (port 3000)

```bash
cd /Users/oogy/Documents/movietobook/movie2book
npm run dev
```

## 3. Open the app

- **App:** http://localhost:3000  
- **Backend health:** http://localhost:8080/health  

The frontend is configured to use `http://localhost:8080` for the video API when running locally (no `EXTERNAL_API_URL` needed).

## 4. Optional: single command (both in one terminal)

From the project root:

```bash
./run-local.sh
```

This starts the backend in the background, then the frontend. Stop with Ctrl+C (frontend); then run `pkill -f gunicorn` or `pkill -f api_server` to stop the backend.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "No module named 'flask'" | `pip install -r requirements_railway.txt` in venv |
| "FFmpeg not found" | Install FFmpeg (e.g. `brew install ffmpeg`) |
| Upload fails / 503 | Ensure backend is running on 8080 and http://localhost:8080/health returns OK |
| Port in use | Use another port: `PORT=3001 npm run dev` or `--bind 0.0.0.0:8081` for API |
