#!/bin/bash
# Start script for Railway - runs both Python backend and Next.js frontend

echo "🚀 Starting Movie2Book..."

# Get port from Railway (defaults to 3000)
PORT=${PORT:-3000}
API_PORT=${API_PORT:-8080}

# Start Python API server in background
echo "📡 Starting Python API server on port $API_PORT..."
PORT=$API_PORT python3 api_server.py &
API_PID=$!

# Wait a moment for API to start
sleep 3

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

# If frontend stops, kill API too
kill $API_PID 2>/dev/null
