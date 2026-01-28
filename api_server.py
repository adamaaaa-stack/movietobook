#!/usr/bin/env python3
"""
Flask API server for video processing.
Deploy this to Railway/Render instead of running on Vercel.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import json
import uuid
from pathlib import Path
import threading
import atexit

app = Flask(__name__)
# Allow Vercel frontend and any origin (for free tier flexibility)
CORS(app, resources={r"/*": {"origins": "*"}})

# Base directories
BASE_DIR = Path(__file__).parent
UPLOADS_DIR = BASE_DIR / 'uploads'
OUTPUTS_DIR = BASE_DIR / 'outputs'

UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

# In-memory job tracking (use Redis in production)
jobs = {}


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'video-processing-api'})


@app.route('/api/process-video', methods=['POST'])
def process_video():
    """
    Start video processing.
    Expects multipart/form-data with 'video' file.
    Returns job_id for status tracking.
    """
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Generate job ID
        job_id = f"job_{uuid.uuid4().hex[:12]}"
        
        # Save uploaded file
        video_path = UPLOADS_DIR / f"{job_id}.mp4"
        video_file.save(str(video_path))
        
        # Output path
        output_path = OUTPUTS_DIR / f"{job_id}.txt"
        
        # Initialize job status
        jobs[job_id] = {
            'status': 'processing',
            'progress': 0,
            'video_path': str(video_path),
            'output_path': str(output_path),
        }
        
        # Start processing in background thread
        def run_processing():
            try:
                script_path = BASE_DIR / 'video_to_narrative.py'
                
                # Run the Python script (don't capture output so progress prints work)
                # Use Popen instead of run to allow real-time output
                process = subprocess.Popen(
                    ['python3', str(script_path), str(video_path), '-o', str(output_path)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1,  # Line buffered
                )
                
                # Stream output for logging (optional, but helpful for debugging)
                import threading
                def log_output():
                    # Log EVERYTHING so Render shows what's happening (ffmpeg, whisper, etc.)
                    try:
                        for line in process.stdout:
                            print(f"[Job {job_id}] {line.rstrip()}", flush=True)
                    except Exception as e:
                        print(f"[Job {job_id}] log_output error: {e}", flush=True)
                
                log_thread = threading.Thread(target=log_output, daemon=True)
                log_thread.start()
                
                # Wait for process to complete
                # Note: wait() doesn't support timeout in Python < 3.3, so we'll let it run
                # The timeout is handled by the subprocess.run timeout if needed
                process.wait()
                
                if process.returncode == 0:
                    jobs[job_id]['status'] = 'completed'
                    jobs[job_id]['progress'] = 100
                else:
                    jobs[job_id]['status'] = 'error'
                    jobs[job_id]['error'] = 'Processing failed. Check logs for details.'
            except subprocess.TimeoutExpired:
                process.kill()
                jobs[job_id]['status'] = 'error'
                jobs[job_id]['error'] = 'Processing timed out after 1 hour'
            except Exception as e:
                jobs[job_id]['status'] = 'error'
                jobs[job_id]['error'] = str(e)
        
        thread = threading.Thread(target=run_processing)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'job_id': job_id,
            'status': 'processing',
            'message': 'Video processing started'
        }), 202
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/status/<job_id>', methods=['GET'])
def get_status(job_id):
    """Get processing status for a job."""
    try:
        # Check if job exists in memory
        if job_id not in jobs:
            # Job not in memory - check if output files exist (might have been restarted)
            output_path = OUTPUTS_DIR / f"{job_id}.txt"
            progress_path = OUTPUTS_DIR / f"{job_id}_progress.json"
            
            if output_path.exists():
                # File exists, job is completed
                return jsonify({
                    'job_id': job_id,
                    'status': 'completed',
                    'progress': 100,
                })
            elif progress_path.exists():
                # Progress file exists, try to read it
                try:
                    with open(progress_path, 'r') as f:
                        progress_data = json.load(f)
                    return jsonify({
                        'job_id': job_id,
                        'status': progress_data.get('status', 'processing'),
                        'progress': progress_data.get('progress', 0),
                        'statusIndex': progress_data.get('status_index', 0),
                        'chunkProgress': progress_data.get('chunk_progress', {'current': 0, 'total': 1}),
                    })
                except:
                    pass
            
            # Job not found and no files exist
            return jsonify({'error': 'Job not found'}), 404
        
        job = jobs[job_id]
        
        # Try to read progress from JSON file (written by video processing script)
        # Replace .txt with _progress.json
        output_path_obj = Path(job['output_path'])
        progress_path = output_path_obj.parent / f"{output_path_obj.stem}_progress.json"
        if progress_path.exists():
            try:
                with open(progress_path, 'r') as f:
                    progress_data = json.load(f)
                    job['status'] = progress_data.get('status', job['status'])
                    job['progress'] = progress_data.get('progress', job.get('progress', 0))
                    job['status_index'] = progress_data.get('status_index', 0)
                    job['chunk_progress'] = progress_data.get('chunk_progress', {'current': 0, 'total': 1})
            except json.JSONDecodeError as e:
                # If JSON is invalid, log but continue with existing status
                print(f"[Warning] Could not parse progress JSON for {job_id}: {e}")
            except Exception as e:
                # If we can't read progress file, continue with existing job status
                print(f"[Warning] Could not read progress file for {job_id}: {e}")
    
        # Check if output file exists (completed)
        output_path = Path(job['output_path'])
        if output_path.exists():
            # If output file exists, mark as completed regardless of current status
            job['status'] = 'completed'
            job['progress'] = 100
        elif job.get('progress', 0) >= 100 and job['status'].lower() in ['completed', 'complete', 'done']:
            # If progress is 100% and status indicates completion, but file doesn't exist yet
            # Wait a bit more - file might still be writing
            job['status'] = 'processing'  # Keep as processing until file exists
        elif job.get('progress', 0) >= 100:
            # Progress is 100% but status doesn't indicate completion
            # Check if file exists one more time
            if output_path.exists():
                job['status'] = 'completed'
            else:
                # File not ready yet, keep processing
                job['status'] = 'processing'
        
        response = {
            'job_id': job_id,
            'status': job['status'].lower() if isinstance(job['status'], str) else job['status'],
            'progress': job.get('progress', 0),
        }
        
        # Include status index and chunk progress if available
        if 'status_index' in job:
            response['statusIndex'] = job['status_index']
        if 'chunk_progress' in job:
            response['chunkProgress'] = job['chunk_progress']
        
        if 'error' in job:
            response['error'] = job['error']
        
        return jsonify(response)
    except Exception as e:
        print(f"[Error] Status endpoint error for {job_id}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/result/<job_id>', methods=['GET'])
def get_result(job_id):
    """Get the processed narrative result."""
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    output_path = Path(job['output_path'])
    
    if not output_path.exists():
        return jsonify({'error': 'Result not ready yet'}), 404
    
    try:
        with open(output_path, 'r', encoding='utf-8') as f:
            narrative = f.read()
        
        return jsonify({
            'job_id': job_id,
            'narrative': narrative,
            'status': 'completed'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
