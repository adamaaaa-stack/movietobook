#!/usr/bin/env bash
# Run full stack locally: Python API on 8080, Next.js on 3000

set -e
cd "$(dirname "$0")"
API_PORT=8080
PORT=${PORT:-3000}

echo "🚀 Starting Movie2Book locally..."
echo ""

# Start Python API in background
echo "📡 Starting Python API on port $API_PORT..."
if command -v gunicorn &>/dev/null; then
  gunicorn --bind "0.0.0.0:${API_PORT}" --workers 1 --threads 4 --timeout 3600 api_server:app &
else
  PORT=$API_PORT python3 api_server.py &
fi
API_PID=$!

cleanup() {
  echo ""
  echo "🛑 Stopping..."
  kill $API_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# Wait for API to be up
echo "⏳ Waiting for API..."
for i in {1..15}; do
  if curl -sf "http://localhost:${API_PORT}/health" >/dev/null 2>&1; then
    echo "✅ API running at http://localhost:${API_PORT}"
    break
  fi
  sleep 1
  if [ $i -eq 15 ]; then
    echo "❌ API did not start in time"
    kill $API_PID 2>/dev/null || true
    exit 1
  fi
done

# Start Next.js
echo "🌐 Starting Next.js on port $PORT..."
echo ""
echo "   App:  http://localhost:${PORT}"
echo "   Stop: Ctrl+C"
echo ""
cd movie2book
PORT=$PORT npm run dev

cleanup
