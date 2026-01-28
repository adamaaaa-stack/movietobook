# Multi-stage build for Fly.io
FROM python:3.11-slim as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt requirements_api.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt && \
    pip install --no-cache-dir --user -r requirements_api.txt

# Final stage
FROM python:3.11-slim

# Install runtime dependencies (FFmpeg + curl for healthcheck)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local

# Set working directory
WORKDIR /app

# Copy application files
COPY video_to_narrative.py api_server.py ./
COPY requirements.txt requirements_api.txt ./

# Create directories for uploads and outputs
RUN mkdir -p uploads outputs

# Make sure scripts are executable
RUN chmod +x video_to_narrative.py api_server.py

# Set environment variables
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the API server
CMD ["gunicorn", "api_server:app", "--bind", "0.0.0.0:8080", "--workers", "1", "--timeout", "3600", "--access-logfile", "-", "--error-logfile", "-"]
