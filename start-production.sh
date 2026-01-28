#!/bin/bash
# Production start script for Railway

echo "🚀 Starting Movie2Book (Production)..."

# Start Python API server in background
echo "📡 Starting Python API server on port 8080..."
python3 api_server.py &
API_PID=$!

# Wait for API to start
sleep 3

# Build Next.js for production (if not already built)
if [ ! -d "movie2book/.next" ]; then
  echo "🔨 Building Next.js for production..."
  cd movie2book
  npm run build
  cd ..
fi

# Start Next.js frontend (production mode)
echo "🌐 Starting Next.js frontend on port 3000..."
cd movie2book
npm start

# If frontend stops, kill API too
kill $API_PID 2>/dev/null
