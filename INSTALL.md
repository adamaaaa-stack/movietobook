# Manual Installation Instructions

The terminal commands are timing out. Please run these commands **manually in your terminal**:

## Step-by-Step Installation

Open Terminal and run these commands one at a time:

```bash
# 1. Navigate to project directory
cd /Users/oogy/Documents/movietobook

# 2. Remove old venv (if exists)
rm -rf venv

# 3. Create new virtual environment
python3.11 -m venv venv

# 4. Upgrade pip
venv/bin/python3 -m pip install --upgrade pip

# 5. Install packages (this will take several minutes)
venv/bin/python3 -m pip install opencv-python
venv/bin/python3 -m pip install openai
venv/bin/python3 -m pip install python-dotenv
venv/bin/python3 -m pip install openai-whisper

# 6. Verify installation
venv/bin/python3 -c "import cv2, openai, dotenv, whisper; print('✅ All packages installed!')"
```

## Or Install All at Once

```bash
cd /Users/oogy/Documents/movietobook
rm -rf venv
python3.11 -m venv venv
venv/bin/python3 -m pip install --upgrade pip
venv/bin/python3 -m pip install opencv-python openai python-dotenv openai-whisper
```

## Troubleshooting

If `opencv-python` fails, try:
```bash
venv/bin/python3 -m pip install opencv-python-headless
```

If you see "command not found" errors:
- Make sure Python 3.11 is installed: `python3.11 --version`
- If not installed: `brew install python@3.11`

## After Installation

Once packages are installed, try uploading a video again. The app should detect the venv and use it automatically.
