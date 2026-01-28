# Video to Narrative Converter

Converts video files into prose narratives using Google's Gemini AI. The script extracts frames from a video, sends each to Gemini for analysis, and combines the descriptions into a flowing narrative.

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Basic usage

```bash
python video_to_narrative.py path/to/video.mp4 -k YOUR_GEMINI_API_KEY
```

### Using environment variable for API key

```bash
export GEMINI_API_KEY="your-api-key-here"
python video_to_narrative.py path/to/video.mp4
```

### Options

| Option | Description |
|--------|-------------|
| `-o, --output` | Output file path (default: `<video_name>_narrative.txt`) |
| `-k, --api-key` | Gemini API key (or use `GEMINI_API_KEY` env variable) |
| `--fps` | Frames per second to extract (default: 1) |
| `--model` | Gemini model to use (default: `gemini-2.0-flash`) |

### Examples

Extract 1 frame every 2 seconds:
```bash
python video_to_narrative.py movie.mp4 --fps 0.5
```

Specify output file:
```bash
python video_to_narrative.py clip.mp4 -o my_story.txt
```

Use a different Gemini model:
```bash
python video_to_narrative.py video.mp4 --model gemini-1.5-pro
```

## Output

The script creates a text file containing:
1. A combined prose narrative of the video
2. Individual frame descriptions with timestamps

## Notes

- Processing time depends on video length and the number of frames extracted
- Gemini API usage is billed based on the number of images and text generated
- For long videos, consider using a lower FPS to reduce API calls
