#!/bin/bash
set -e

echo "=========================================="
echo "Setting up Python virtual environment..."
echo "=========================================="
echo ""

# Remove old venv if it exists
if [ -d "venv" ]; then
    echo "🗑️  Removing old virtual environment..."
    rm -rf venv
fi

# Create new venv with Python 3.11
echo "📦 Creating new virtual environment with Python 3.11..."
python3.11 -m venv venv
echo "✓ Virtual environment created"
echo ""

# Activate venv
echo "🔧 Activating virtual environment..."
source venv/bin/activate
echo "✓ Activated"
echo ""

# Upgrade pip
echo "⬆️  Upgrading pip, setuptools, and wheel..."
venv/bin/pip install --upgrade pip setuptools wheel
echo "✓ Pip upgraded"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
echo "   This may take a few minutes (downloading packages)..."
echo ""
venv/bin/pip install --progress-bar on opencv-python openai python-dotenv openai-whisper
echo ""
echo "✓ All packages installed"
echo ""

# Test cv2 import
echo "🧪 Testing imports..."
if venv/bin/python3 -c "import cv2; print('✓ cv2 OK')" 2>/dev/null; then
    echo "✓ cv2 import successful"
else
    echo "⚠️  cv2 import failed. Trying opencv-python-headless..."
    venv/bin/pip uninstall -y opencv-python 2>/dev/null || true
    venv/bin/pip install --progress-bar on opencv-python-headless
    if venv/bin/python3 -c "import cv2; print('✓ cv2 OK')" 2>/dev/null; then
        echo "✓ cv2 import successful (using headless version)"
    else
        echo "❌ cv2 still failing. You may need to install FFmpeg libraries."
        echo "   Run: brew install ffmpeg"
        exit 1
    fi
fi

# Test other imports
venv/bin/python3 -c "import openai; print('✓ openai OK')" 2>/dev/null && echo "✓ openai import successful"
venv/bin/python3 -c "import dotenv; print('✓ dotenv OK')" 2>/dev/null && echo "✓ dotenv import successful"
venv/bin/python3 -c "import whisper; print('✓ whisper OK')" 2>/dev/null && echo "✓ whisper import successful"

echo ""
echo "=========================================="
echo "✅ Virtual environment setup complete!"
echo "=========================================="
echo ""
echo "To activate manually: source venv/bin/activate"
echo ""
