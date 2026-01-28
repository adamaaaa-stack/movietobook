#!/bin/bash
# Cleanup old uploads and outputs to free disk space

echo "Cleaning up old files..."

cd "$(dirname "$0")"

# Remove uploads older than 1 day
echo "Removing uploads older than 1 day..."
find uploads/ -name "*.mp4" -type f -mtime +1 -delete
echo "✓ Old uploads cleaned"

# Remove outputs older than 1 day
echo "Removing outputs older than 1 day..."
find outputs/ -name "*.txt" -type f -mtime +1 -delete
find outputs/ -name "*.json" -type f -mtime +1 -delete
find outputs/ -name "*.log" -type f -mtime +1 -delete
echo "✓ Old outputs cleaned"

# Show disk space
echo ""
echo "Disk space:"
df -h . | tail -1

echo ""
echo "✓ Cleanup complete!"
