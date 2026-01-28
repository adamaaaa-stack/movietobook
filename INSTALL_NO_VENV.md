# Installation Without Virtual Environment

Install packages directly to your system Python:

## Install Packages

```bash
pip3 install opencv-python openai python-dotenv openai-whisper
```

Or if you need to use `--user` flag:

```bash
pip3 install --user opencv-python openai python-dotenv openai-whisper
```

Or if you get permission errors, use `--break-system-packages` (macOS Homebrew Python):

```bash
pip3 install --break-system-packages opencv-python openai python-dotenv openai-whisper
```

## Verify Installation

```bash
python3 -c "import cv2; import openai; import dotenv; import whisper; print('✅ All packages installed!')"
```

## After Installation

The app will automatically use system Python with the installed packages. No venv needed!
