# Virtual Environment Setup

If you're experiencing issues with the venv (especially cv2 import errors), run:

```bash
cd /Users/oogy/Documents/movietobook
./setup_venv.sh
```

Or manually:

```bash
cd /Users/oogy/Documents/movietobook
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install opencv-python openai python-dotenv openai-whisper
```

If cv2 still fails, try:
```bash
pip uninstall opencv-python opencv-python-headless
pip install opencv-python-headless
```

Make sure FFmpeg is installed:
```bash
brew install ffmpeg
```
