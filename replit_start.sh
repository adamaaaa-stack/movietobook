#!/bin/bash
# Start script for Replit - runs both frontend and backend

echo "🚀 Starting Movie2Book..."

# Start Python API server in background
echo "📡 Starting Python API server..."
python3 api_server.py &
API_PID=$!

# Wait a moment for API to start
sleep 2

# Start Next.js frontend
echo "🌐 Starting Next.js frontend..."
cd movie2book
npm run dev

# If frontend stops, kill API too
kill $API_PID 2>/dev/null
