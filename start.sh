#!/bin/bash
# Start script for Railway - runs both Python backend and Next.js frontend

echo "🚀 Starting Movie2Book..."

# Start Python API server in background
echo "📡 Starting Python API server on port 8080..."
python3 api_server.py &
API_PID=$!

# Wait a moment for API to start
sleep 3

# Start Next.js frontend
echo "🌐 Starting Next.js frontend on port 3000..."
cd movie2book
npm run dev

# If frontend stops, kill API too
kill $API_PID 2>/dev/null
