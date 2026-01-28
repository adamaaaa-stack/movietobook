# Multi-stage Dockerfile for Railway (Python + Node.js)
FROM python:3.11-slim as python-base

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements_railway.txt .
RUN pip install --no-cache-dir -r requirements_railway.txt

# Install Node.js dependencies
COPY movie2book/package.json movie2book/package-lock.json movie2book/
WORKDIR /app/movie2book
RUN npm ci

# Copy application files
WORKDIR /app
COPY . .

# Create directories
RUN mkdir -p uploads outputs

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Start both services
CMD ["sh", "start.sh"]
