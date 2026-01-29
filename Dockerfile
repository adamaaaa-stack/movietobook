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

# Copy all Next.js source files needed for build
# Note: Only PayPal webhook route exists (Stripe/PayFast/LemonSqueezy removed)
# Copy package files first for better caching
COPY movie2book/package.json movie2book/package-lock.json movie2book/
# Copy source files
COPY movie2book/app movie2book/app
COPY movie2book/lib movie2book/lib
COPY movie2book/public movie2book/public
COPY movie2book/middleware.ts movie2book/
COPY movie2book/next.config.ts movie2book/
COPY movie2book/tsconfig.json movie2book/
COPY movie2book/postcss.config.mjs movie2book/
# Cache-busting: Force rebuild by adding timestamp
RUN echo "Build timestamp: $(date +%s)" > /tmp/build_time.txt

# Install Node.js dependencies and build Next.js (production build)
# Do not set NODE_ENV=production before npm ci - it would skip devDependencies (e.g. TypeScript for next.config.ts)
WORKDIR /app/movie2book
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm ci --prefer-offline --no-audit && NODE_ENV=production npm run build

# Copy remaining application files
WORKDIR /app
COPY start.sh api_server.py video_to_narrative.py ./
COPY requirements_railway.txt ./

# Create directories
RUN mkdir -p uploads outputs

# Make start script executable
RUN chmod +x start.sh

# Ensure production mode at runtime
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start both services
CMD ["sh", "start.sh"]
