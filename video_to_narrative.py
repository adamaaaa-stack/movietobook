#!/usr/bin/env python3
"""
Video to Narrative Converter

Takes a video file, extracts frames, sends each to GPT-5-nano for descriptions,
transcribes audio, and creates one flowing novel-like narrative.
"""

import argparse
import base64
import json
import os
import sys
import time
import math
import subprocess
import tempfile
from pathlib import Path

import cv2
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Settings
CHUNK_DURATION = 600  # 10 minutes in seconds
FRAME_INTERVAL = 10   # Extract 1 frame every 10 seconds (audio fills the gaps)
REQUEST_DELAY = 0.2   # Seconds between API calls (reduced for speed)
MAX_RETRIES = 5
INITIAL_RETRY_DELAY = 5


def get_video_info(video_path: str) -> tuple[float, int, float]:
    """Get video FPS, total frames, and duration."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0
    cap.release()
    
    return fps, total_frames, duration


def extract_audio(video_path: str, output_path: str = None) -> str:
    """Extract audio from video using FFmpeg and save as WAV."""
    if output_path is None:
        # Create temporary file
        fd, output_path = tempfile.mkstemp(suffix='.wav')
        os.close(fd)
    
    print(f"  Extracting audio to: {output_path}")
    sys.stdout.flush()
    
    try:
        # Use FFmpeg to extract audio
        # Redirect stderr to stdout to capture FFmpeg's progress messages
        process = subprocess.Popen(
            ['ffmpeg', '-i', video_path, '-vn', '-acodec', 'pcm_s16le', 
             '-ar', '16000', '-ac', '1', '-y', output_path, '-loglevel', 'error'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,  # Redirect stderr to stdout
            text=True,
            bufsize=1  # Line buffered
        )
        
        # Stream output in real-time for debugging
        output_lines = []
        while True:
            line = process.stdout.readline()
            if not line and process.poll() is not None:
                break
            if line:
                output_lines.append(line.strip())
                # Print progress every few lines
                if len(output_lines) % 10 == 0:
                    print(f"  FFmpeg progress: {len(output_lines)} lines processed...")
                    sys.stdout.flush()
        
        # Wait for process to complete
        returncode = process.wait()
        
        if returncode != 0:
            error_msg = '\n'.join(output_lines[-10:])  # Last 10 lines
            if "No such file" in error_msg:
                raise RuntimeError(f"Video file not found: {video_path}")
            elif "Invalid data" in error_msg or "could not find codec" in error_msg:
                raise RuntimeError(f"Video file appears corrupted or unsupported")
            elif "No audio stream" in error_msg or "Stream #0" not in error_msg:
                raise RuntimeError(f"Video has no audio track")
            else:
                raise RuntimeError(f"FFmpeg failed (code {returncode}): {error_msg[:300]}")
        
        # Verify output file was created and has content
        if not os.path.exists(output_path):
            raise RuntimeError("FFmpeg completed but output file was not created")
        
        file_size = os.path.getsize(output_path)
        if file_size == 0:
            raise RuntimeError("FFmpeg created empty audio file - video may have no audio track")
        
        print(f"  ✓ Audio extracted successfully ({file_size / 1024 / 1024:.2f} MB)")
        sys.stdout.flush()
        return output_path
        
    except FileNotFoundError:
        raise RuntimeError("FFmpeg not found. Please install FFmpeg: brew install ffmpeg")
    except Exception as e:
        if isinstance(e, RuntimeError):
            raise
        raise RuntimeError(f"Unexpected error extracting audio: {e}")


def transcribe_audio(audio_path: str) -> list[tuple[float, float, str]]:
    """
    Transcribe audio using Whisper and return list of (start, end, text) segments.
    
    Returns:
        List of tuples: (start_time, end_time, dialogue_text)
    """
    # Lazy import Whisper only when needed
    try:
        import whisper
    except ImportError:
        raise RuntimeError("Whisper not installed. Run: pip install openai-whisper")
    
    print("  Loading Whisper model (this may take a moment on first run - downloading ~75MB)...", end=' ', flush=True)
    try:
        # Use 'tiny' model for faster transcription (much faster than 'base')
        model = whisper.load_model("tiny")
        print("done")
    except Exception as e:
        print(f"failed: {e}")
        raise
    
    print("  Transcribing audio (this may take a while)...", end=' ', flush=True)
    # Use more aggressive settings to catch quiet audio
    result = model.transcribe(
        audio_path, 
        word_timestamps=False,
        fp16=False,  # Use FP32 for better accuracy
        language=None,  # Auto-detect language
        task="transcribe",  # Transcribe speech, not translate
        verbose=False
    )
    print("done")
    
    # Extract segments with timestamps
    segments = []
    for segment in result.get("segments", []):
        start = segment["start"]
        end = segment["end"]
        text = segment["text"].strip()
        # Filter out very short segments (likely noise) but keep meaningful dialogue
        if text and len(text) > 2:  # Only include non-empty segments with at least 3 chars
            segments.append((start, end, text))
    
    if len(segments) == 0:
        print("  ⚠️  WARNING: No dialogue detected. The video may have:")
        print("     - No audio track")
        print("     - Only background music/noise (no speech)")
        print("     - Very quiet audio")
        print("     - Non-English speech that Whisper couldn't detect")
    
    return segments


def get_dialogue_for_time_range(transcription: list[tuple[float, float, str]], 
                                 start_time: float, end_time: float) -> list[str]:
    """
    Get dialogue segments that fall within the specified time range.
    
    Returns:
        List of dialogue strings
    """
    dialogue = []
    for seg_start, seg_end, text in transcription:
        # Check if segment overlaps with the time range
        if seg_start < end_time and seg_end > start_time:
            dialogue.append(text)
    return dialogue


def extract_frames_for_chunk(video_path: str, start_time: float, end_time: float, 
                              fps: float, interval: int = 10) -> list[tuple[int, bytes]]:
    """
    Extract frames from a specific time range of the video.
    
    Args:
        video_path: Path to video file
        start_time: Start time in seconds
        end_time: End time in seconds
        fps: Video FPS
        interval: Seconds between frame extractions (extracts 1 frame per interval)
    
    Returns:
        List of (timestamp, frame_bytes) tuples
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")
    
    frames = []
    current_time = start_time
    
    while current_time < end_time:
        # Extract 1 frame per interval (audio transcription fills the gaps)
        frame_number = int(current_time * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        
        ret, frame = cap.read()
        if ret:
            # Encode frame as JPEG bytes
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            frame_bytes = buffer.tobytes()
            frames.append((int(current_time), frame_bytes))
        
        current_time += interval
    
    cap.release()
    return frames


def describe_frame(client: OpenAI, frame_bytes: bytes, timestamp: int) -> str:
    """Send a frame to GPT-5-nano and get a description."""
    image_base64 = base64.b64encode(frame_bytes).decode('utf-8')
    
    prompt = f"""Describe this video frame at {timestamp}s. Focus on main action, characters, and setting. Be brief (1-2 sentences)."""

    retry_delay = INITIAL_RETRY_DELAY
    
    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(
                model="gpt-5-nano",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ],
                max_completion_tokens=500  # Reduced for faster responses
            )
            content = response.choices[0].message.content
            return content if content else "[No description]"
        except Exception as e:
            if "429" in str(e) or "rate" in str(e).lower():
                if attempt < MAX_RETRIES - 1:
                    print(f" (rate limited, waiting {retry_delay}s)", end='', flush=True)
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    raise
            else:
                raise
    
    return "[Could not analyze frame]"


def create_final_narrative(client: OpenAI, descriptions: list[tuple[int, str]], 
                           dialogue: list[str] = None) -> str:
    """Create a final narrative from frame descriptions (for single-chunk videos)."""
    formatted = "\n\n".join(f"[{ts}s] {desc}" for ts, desc in descriptions)
    
    dialogue_text = ""
    if dialogue and len(dialogue) > 0:
        dialogue_text = "\n\nDialogue (what people are saying):\n" + "\n".join(f"- {line}" for line in dialogue)
        print(f"  Including {len(dialogue)} dialogue segments in narrative")
    else:
        print("  No dialogue found for this scene")
    
    prompt = f"""Here are visual snapshots (1 per 10 seconds) and the dialogue for this scene. 
The dialogue fills in what happens between the visual snapshots.
Write it as narrative prose — describe what we see and incorporate the dialogue naturally, like a novel would.
IMPORTANT: Use the dialogue to fill in gaps between visual descriptions. Put dialogue in quotes and make it feel natural.
Don't mention frames, timestamps, or camera angles. 
Just tell the story of what's happening to the characters. 
Use descriptive language, emotions, and flow between scenes naturally.
The dialogue provides context for what happens between the visual snapshots.

Visual snapshots:
{formatted}{dialogue_text}

Write the narrative:"""

    retry_delay = INITIAL_RETRY_DELAY
    
    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(
                model="gpt-5-nano",
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=8000
            )
            content = response.choices[0].message.content
            if not content or len(content.strip()) < 50:
                print(f"  Warning: Short or empty response (length: {len(content) if content else 0})")
                if attempt < MAX_RETRIES - 1:
                    print(f"  Retrying... (attempt {attempt + 2}/{MAX_RETRIES})")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    raise ValueError("API returned empty or very short content after all retries")
            return content
        except Exception as e:
            error_msg = str(e)
            print(f"  Error on attempt {attempt + 1}/{MAX_RETRIES}: {error_msg[:200]}")
            if "429" in error_msg or "rate" in error_msg.lower():
                if attempt < MAX_RETRIES - 1:
                    print(f"  Rate limited, waiting {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    raise RuntimeError(f"Narrative generation failed after {MAX_RETRIES} attempts: {error_msg}")
            elif attempt < MAX_RETRIES - 1:
                print(f"  Retrying in {retry_delay}s...")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise RuntimeError(f"Narrative generation failed: {error_msg}")
    
    raise RuntimeError("Narrative generation failed after all retries")


def create_chunk_narrative(client: OpenAI, descriptions: list[tuple[int, str]], 
                           chunk_num: int, dialogue: list[str] = None) -> str:
    """Create a mini-narrative for a chunk of frame descriptions."""
    formatted = "\n\n".join(f"[{ts}s] {desc}" for ts, desc in descriptions)
    
    dialogue_text = ""
    if dialogue and len(dialogue) > 0:
        dialogue_text = "\n\nDialogue (what people are saying):\n" + "\n".join(f"- {line}" for line in dialogue)
        print(f"  Including {len(dialogue)} dialogue segments in chunk narrative")
    else:
        print("  No dialogue found for this chunk")
    
    prompt = f"""Here are visual snapshots (1 per 10 seconds) and the dialogue for this scene. 
The dialogue fills in what happens between the visual snapshots.
Write it as narrative prose — describe what we see and incorporate the dialogue naturally, like a novel would.
IMPORTANT: Use the dialogue to fill in gaps between visual descriptions. Put dialogue in quotes and make it feel natural.
Don't mention frames, timestamps, or camera angles. 
Just tell the story of what's happening to the characters. 
Use descriptive language, emotions, and flow between scenes naturally.
The dialogue provides context for what happens between the visual snapshots.

Visual snapshots:
{formatted}{dialogue_text}

Write the mini-narrative:"""

    retry_delay = INITIAL_RETRY_DELAY
    
    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(
                model="gpt-5-nano",
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=4000
            )
            content = response.choices[0].message.content
            if not content or len(content.strip()) < 50:
                print(f"  Warning: Short or empty response (length: {len(content) if content else 0})")
                if attempt < MAX_RETRIES - 1:
                    print(f"  Retrying... (attempt {attempt + 2}/{MAX_RETRIES})")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    raise ValueError("API returned empty or very short content after all retries")
            return content
        except Exception as e:
            error_msg = str(e)
            print(f"  Error on attempt {attempt + 1}/{MAX_RETRIES}: {error_msg[:200]}")
            if "429" in error_msg or "rate" in error_msg.lower():
                if attempt < MAX_RETRIES - 1:
                    print(f"  Rate limited, waiting {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    raise RuntimeError(f"Chunk narrative generation failed after {MAX_RETRIES} attempts: {error_msg}")
            elif attempt < MAX_RETRIES - 1:
                print(f"  Retrying in {retry_delay}s...")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise RuntimeError(f"Chunk narrative generation failed: {error_msg}")
    
    raise RuntimeError("Chunk narrative generation failed after all retries")


def combine_narratives(client: OpenAI, chunk_narratives: list[str]) -> str:
    """Combine all chunk narratives into one flowing story."""
    formatted = "\n\n---\n\n".join(
        f"Chapter {i+1}:\n{narrative}" for i, narrative in enumerate(chunk_narratives)
    )
    
    prompt = f"""Combine these chapter summaries into one flowing narrative story. 
Make it read like a novel with smooth transitions between sections.
Remove any redundancy while keeping important details.
Don't mention chapters, sections, or that this was assembled from parts.

Chapter summaries:
{formatted}

Write the combined narrative:"""

    retry_delay = INITIAL_RETRY_DELAY
    
    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(
                model="gpt-5-nano",
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=8000
            )
            content = response.choices[0].message.content
            return content if content else "[No final narrative generated]"
        except Exception as e:
            if "429" in str(e) or "rate" in str(e).lower():
                if attempt < MAX_RETRIES - 1:
                    print(f" (rate limited, waiting {retry_delay}s)", end='', flush=True)
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    raise
            else:
                raise
    
    return "[Could not generate final narrative]"


def main():
    parser = argparse.ArgumentParser(
        description="Convert a video into a prose narrative using GPT-5-nano (chunked processing)"
    )
    parser.add_argument("video_path", help="Path to the input video file")
    parser.add_argument("-o", "--output", help="Output file path")
    parser.add_argument("-k", "--api-key", help="OpenAI API key")
    parser.add_argument("--frame-interval", type=int, default=10,
                        help="Extract 1 frame every N seconds (default: 10)")
    
    args = parser.parse_args()
    
    # Validate video path
    if not os.path.exists(args.video_path):
        print(f"Error: Video file not found: {args.video_path}")
        sys.exit(1)
    
    # Get API key
    api_key = args.api_key or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OpenAI API key required. Use --api-key or set OPENAI_API_KEY")
        sys.exit(1)
    
    # Set output path
    if args.output:
        output_path = args.output
    else:
        video_name = Path(args.video_path).stem
        output_path = f"{video_name}_narrative.txt"
    
    # Progress file path (for API status tracking)
    # Use absolute path to ensure it's in the outputs directory
    output_dir = os.path.dirname(os.path.abspath(output_path))
    os.makedirs(output_dir, exist_ok=True)  # Ensure directory exists
    progress_path = os.path.join(output_dir, os.path.basename(output_path).replace('.txt', '_progress.json'))
    
    # Write initial progress immediately
    try:
        initial_progress = {
            'status': 'Starting...',
            'progress': 0,
            'status_index': 0,
            'chunk_progress': {'current': 0, 'total': 1},
            'timestamp': time.time()
        }
        with open(progress_path, 'w') as f:
            json.dump(initial_progress, f)
        print(f"[Progress] Initial progress written to {progress_path}")
    except Exception as e:
        print(f"[Warning] Could not write initial progress: {e}")
    
    def update_progress(status: str, progress: int, status_index: int = 0, chunk_progress: dict = None):
        """Write progress to JSON file for API to read."""
        try:
            # Ensure output directory exists
            os.makedirs(output_dir, exist_ok=True)
            progress_data = {
                'status': status,
                'progress': progress,
                'status_index': status_index,
                'chunk_progress': chunk_progress or {'current': 0, 'total': 1},
                'timestamp': time.time()
            }
            with open(progress_path, 'w') as f:
                json.dump(progress_data, f)
            print(f"\n[Progress Update] {status} - {progress}%", flush=True)
        except Exception as e:
            print(f"\n[Progress Update Failed] {e}", flush=True)
            pass  # Don't fail if progress file can't be written
    
    # Configure
    frame_interval = args.frame_interval
    
    # Initialize client
    try:
        client = OpenAI(api_key=api_key)
        update_progress('Initializing...', 5, 0)
    except Exception as e:
        error_msg = f"Failed to initialize OpenAI client: {e}"
        print(f"Error: {error_msg}")
        update_progress(f'Error: {error_msg}', 0, 0)
        sys.exit(1)
    
    # Get video info
    print(f"Analyzing video: {args.video_path}")
    update_progress('Analyzing video...', 5, 0)
    try:
        fps, total_frames, duration = get_video_info(args.video_path)
    except Exception as e:
        error_msg = f"Failed to analyze video: {e}"
        print(f"Error: {error_msg}")
        update_progress(f'Error: {error_msg}', 0, 0)
        sys.exit(1)
    print(f"Video info: {fps:.2f} FPS, {total_frames} frames, {duration:.2f} seconds ({duration/60:.1f} minutes)")
    print(f"Extracting 1 frame every {frame_interval} seconds (audio will fill the gaps)")
    print("-" * 60)
    
    # Extract and transcribe audio
    update_progress('Starting...', 5, 0)
    update_progress('Extracting audio...', 10, 0)
    print("\n[Audio Processing]")
    print("  Extracting audio from video...")
    print(f"  Video file: {args.video_path}")
    print(f"  Video file exists: {os.path.exists(args.video_path)}")
    if os.path.exists(args.video_path):
        file_size = os.path.getsize(args.video_path) / (1024 * 1024)
        print(f"  Video file size: {file_size:.2f} MB")
    sys.stdout.flush()
    
    audio_path = None
    transcription = []
    try:
        audio_path = extract_audio(args.video_path)
        print("  ✓ Audio extraction complete")
        sys.stdout.flush()
        update_progress('Transcribing dialogue...', 20, 1)
        print("  Transcribing audio (this may take a while, especially on first run - downloading Whisper model)...")
        sys.stdout.flush()
        
        transcription = transcribe_audio(audio_path)
        print(f"  Found {len(transcription)} dialogue segments")
        if transcription:
            print(f"  Sample dialogue: {transcription[0][2][:100] if len(transcription) > 0 else 'N/A'}...")
        else:
            print("  ⚠️  WARNING: No dialogue was transcribed. The video may have no audio or very quiet audio.")
        sys.stdout.flush()
        update_progress('Analyzing frames...', 30, 2)
    except Exception as e:
        error_msg = f"Audio processing failed: {e}"
        print(f"\n❌ Error: {error_msg}")
        import traceback
        traceback.print_exc()
        print("\n  Troubleshooting:")
        print("    - Ensure FFmpeg is installed: brew install ffmpeg")
        print("    - Ensure Whisper is installed: pip install openai-whisper")
        print("    - Check video file is valid and not corrupted")
        update_progress(f'Error: {error_msg}', 0, 0)
        sys.exit(1)
    finally:
        # Clean up temporary audio file
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except:
                pass
    
    print("-" * 60)
    
    all_descriptions = []
    
    # Extract frames for entire video
    print(f"\n[Processing Video] Extracting frames...", end=' ', flush=True)
    frames = extract_frames_for_chunk(args.video_path, 0, duration, fps, frame_interval)
    print(f"got {len(frames)} frames")
    
    if not frames:
        raise RuntimeError("No frames extracted from video")
    
    # Describe each frame
    print(f"  Analyzing {len(frames)} frames with GPT-5-nano...")
    descriptions = []
    for i, (timestamp, frame_bytes) in enumerate(frames):
        frame_progress = 30 + (i / len(frames)) * 50
        update_progress('Analyzing frames...', int(frame_progress), 2)
        if i % 10 == 0 or i == len(frames) - 1:  # Print every 10th frame
            print(f"    Frame {i+1}/{len(frames)} (at {timestamp}s)...", end=' ', flush=True)
        try:
            desc = describe_frame(client, frame_bytes, timestamp)
            descriptions.append((timestamp, desc))
            all_descriptions.append((timestamp, desc))
            if i % 10 == 0 or i == len(frames) - 1:
                print("done")
        except Exception as e:
            if i % 10 == 0 or i == len(frames) - 1:
                print(f"failed: {e}")
            descriptions.append((timestamp, "[Could not analyze]"))
            all_descriptions.append((timestamp, "[Could not analyze]"))
        
        # Only delay if not the last frame
        if i < len(frames) - 1:
            time.sleep(REQUEST_DELAY)
    
    # Get dialogue for entire video
    video_dialogue = []
    if transcription:
        video_dialogue = get_dialogue_for_time_range(transcription, 0, duration)
        if video_dialogue:
            print(f"  Found {len(video_dialogue)} dialogue segments")
    
    # Create final narrative
    update_progress('Creating narrative...', 80, 3)
    print(f"  Creating narrative...", end=' ', flush=True)
    try:
        if not descriptions:
            raise ValueError("No frame descriptions available")
        final_narrative = create_final_narrative(client, descriptions, video_dialogue)
        if not final_narrative or len(final_narrative.strip()) < 50:
            raise ValueError("Generated narrative is empty or too short")
        print("done")
    except Exception as e:
        error_msg = str(e)
        print(f"failed: {error_msg}")
        import traceback
        traceback.print_exc()
        raise RuntimeError(f"Failed to generate narrative: {error_msg}")
    
    update_progress('Almost done...', 95, 4)
    
    # Write output file BEFORE marking as completed
    print("\n[Writing Output]")
    print(f"  Writing narrative to: {output_path}")
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            # Write only the story - clean narrative output
            f.write(final_narrative)
            f.write("\n")
        
        print("  Output file written successfully")
    except Exception as e:
        print(f"  ERROR writing output file: {e}")
        raise
    
    # Mark as completed AFTER file is written
    print(f"\n{'='*60}")
    print(f"✅ Complete! Narrative saved to: {output_path}")
    print(f"Total frames analyzed: {len(all_descriptions)}")
    if transcription:
        print(f"Dialogue segments: {len(transcription)}")
    print("Done!")
    update_progress('Completed', 100, 4)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
