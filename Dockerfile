# Multi-stage Dockerfile for Railway (Python + Node.js)
FROM python:3.11-slim

# Install system dependencies (curl, Node.js, FFmpeg)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (cached layer)
COPY requirements_railway.txt .
RUN pip install --no-cache-dir -r requirements_railway.txt

# Install Node.js dependencies and build Next.js (cached layer)
COPY movie2book/package.json movie2book/package-lock.json movie2book/
WORKDIR /app/movie2book
RUN npm ci --prefer-offline --no-audit && npm run build

# Copy application files (only what's needed)
WORKDIR /app
COPY start.sh api_server.py video_to_narrative.py ./
COPY movie2book/ ./movie2book/
COPY requirements_railway.txt ./

# Create directories
RUN mkdir -p uploads outputs

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Start both services
CMD ["sh", "start.sh"]
