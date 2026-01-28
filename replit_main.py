#!/usr/bin/env python3
"""
Flask API server for video processing - Replit version.
Copy this to Replit as main.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import json
import uuid
from pathlib import Path
import threading

app = Flask(__name__)
# Allow all origins (Replit public URL)
CORS(app, resources={r"/*": {"origins": "*"}})

# Base directories
BASE_DIR = Path(__file__).parent
UPLOADS_DIR = BASE_DIR / 'uploads'
OUTPUTS_DIR = BASE_DIR / 'outputs'

UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

# In-memory job tracking
jobs = {}


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'video-processing-api', 'platform': 'replit'})


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
                
                # Run the Python script
                result = subprocess.run(
                    ['python3', str(script_path), str(video_path), '-o', str(output_path)],
                    capture_output=True,
                    text=True,
                    timeout=3600,  # 1 hour max
                )
                
                if result.returncode == 0:
                    jobs[job_id]['status'] = 'completed'
                    jobs[job_id]['progress'] = 100
                else:
                    jobs[job_id]['status'] = 'error'
                    jobs[job_id]['error'] = result.stderr[:500]
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
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    
    # Check if output file exists
    output_path = Path(job['output_path'])
    if output_path.exists() and job['status'] == 'processing':
        job['status'] = 'completed'
        job['progress'] = 100
    
    response = {
        'job_id': job_id,
        'status': job['status'],
        'progress': job.get('progress', 0),
    }
    
    if 'error' in job:
        response['error'] = job['error']
    
    return jsonify(response)


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
    # Replit provides PORT automatically
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
