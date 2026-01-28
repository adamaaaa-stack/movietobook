#!/bin/bash
# Start script for Railway - runs both Python backend and Next.js frontend

echo "🚀 Starting Movie2Book..."

# Get port from Railway (defaults to 3000)
PORT=${PORT:-3000}
API_PORT=8080

# Start Python API server in background (internal port)
echo "📡 Starting Python API server on port $API_PORT..."
# Run unbuffered so logs show up immediately.
# Also tee to a file so we can inspect logs if needed.
PORT=$API_PORT PYTHONUNBUFFERED=1 python3 -u api_server.py 2>&1 | tee /tmp/api_server.log &
API_PID=$!

# Wait for API to start and verify it's running
echo "⏳ Waiting for API server to start..."
for i in {1..10}; do
  sleep 1
  if curl -f http://localhost:$API_PORT/health > /dev/null 2>&1; then
    echo "✅ API server is running on port $API_PORT"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "❌ API server failed to start after 10 seconds"
    echo "📋 API server logs:"
    cat /tmp/api_server.log
    exit 1
  fi
done

# Start Next.js frontend (production mode if built, dev if not)
echo "🌐 Starting Next.js frontend on port $PORT..."
cd movie2book
if [ -d ".next" ]; then
  echo "  Using production build..."
  PORT=$PORT npm start
else
  echo "  Using development mode..."
  PORT=$PORT npm run dev
fi

# Function to cleanup on exit
cleanup() {
  echo "🛑 Shutting down..."
  kill $API_PID 2>/dev/null
  wait $API_PID 2>/dev/null
  exit 0
}

# Trap signals to cleanup
trap cleanup SIGTERM SIGINT

# Wait for frontend process
wait

# If frontend stops, kill API too
cleanup
