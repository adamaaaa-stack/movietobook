# Video to Book Converter - Web App

A modern Next.js web application that converts videos into beautiful prose narratives using AI.

## Features

- 🎬 **Video Upload** - Drag and drop video files
- 🎨 **Beautiful UI** - Modern, animated interface with Framer Motion
- 📚 **Multiple Formats** - Download as TXT, PDF, or EPUB
- ⚡ **Real-time Progress** - Watch your video being processed
- 🎉 **Celebrations** - Confetti when your book is ready!

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the Python script and virtual environment are set up in the parent directory:
```bash
cd ..
./venv/bin/pip install -r requirements.txt
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app directory
  - `/page.tsx` - Home page
  - `/upload` - Upload page
  - `/processing` - Processing page with progress
  - `/result` - Result page with downloads
  - `/api` - API routes for backend
- `/uploads` - Temporary video storage
- `/outputs` - Generated narrative files

## API Routes

- `POST /api/upload` - Upload video file
- `GET /api/status?jobId=xxx` - Check processing status
- `GET /api/result?jobId=xxx` - Get final narrative

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- jsPDF
- epub-gen
- react-confetti
- react-toastify
