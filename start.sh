#!/bin/bash
# Start script for Railway - runs both Python backend and Next.js frontend

echo "🚀 Starting Movie2Book..."

# Start Python API server in background
echo "📡 Starting Python API server on port 8080..."
python3 api_server.py &
API_PID=$!

# Wait a moment for API to start
sleep 3

# Start Next.js frontend (production mode if built, dev if not)
echo "🌐 Starting Next.js frontend on port 3000..."
cd movie2book
if [ -d ".next" ]; then
  echo "  Using production build..."
  npm start
else
  echo "  Using development mode..."
  npm run dev
fi

# If frontend stops, kill API too
kill $API_PID 2>/dev/null
