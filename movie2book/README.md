# Movie2Book - Turn Any Movie Into a Novel

A modern Next.js web application that converts videos into beautiful prose narratives using AI.

## Features

- 🎬 **Video Upload** - Drag and drop video files with authentication
- 🎨 **Beautiful UI** - Modern, animated interface with Framer Motion
- 📚 **Multiple Formats** - Download as TXT, PDF, or EPUB
- ⚡ **Real-time Progress** - Watch your video being processed
- 🎉 **Celebrations** - Confetti when your book is ready!
- 🔐 **User Authentication** - Sign up/sign in with Supabase
- 💾 **Cloud Storage** - Books stored in Supabase
- 📜 **Legal Pages** - Terms of Service and Privacy Policy

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API and copy your:
   - Project URL
   - Anon/Public Key
3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Schema

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the SQL from `supabase/schema.sql` to create the necessary tables

### 4. Python Script Setup

Make sure the Python script (`../video_to_narrative.py`) and virtual environment are set up:

```bash
cd ..
./venv/bin/pip install -r requirements.txt
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app directory
  - `/page.tsx` - Home page
  - `/upload` - Upload page (requires auth)
  - `/processing` - Processing page with progress
  - `/result` - Result page with downloads
  - `/auth` - Authentication pages
  - `/terms` - Terms of Service
  - `/privacy` - Privacy Policy
  - `/api` - API routes for backend
- `/lib/supabase` - Supabase client setup
- `/supabase` - Database schema SQL

## API Routes

- `POST /api/upload` - Upload video file (requires auth)
- `GET /api/status?jobId=xxx` - Check processing status
- `GET /api/result?jobId=xxx` - Get final narrative
- `POST /api/download-epub` - Generate EPUB file

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (Auth + Database)
- jsPDF
- epub-gen
- react-confetti
- react-toastify

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The app uses two main tables:

1. **jobs** - Tracks video processing jobs
2. **books** - Stores generated narratives

See `supabase/schema.sql` for the complete schema with RLS policies.

## Deployment

1. Deploy to Vercel or your preferred platform
2. Add environment variables
3. Ensure Python script is accessible from the server
4. Set up Supabase project with the schema

## License

MIT
