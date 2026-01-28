# Movie2Book Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for it to finish provisioning

2. **Get Your Credentials**
   - Go to Settings → API
   - Copy your Project URL and anon/public key

3. **Create Environment File**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set Up Database**
   - Go to SQL Editor in Supabase
   - Copy and paste the contents of `supabase/schema.sql`
   - Click "Run" to create the tables

### 3. Verify Python Script

Make sure the Python script is set up in the parent directory:
```bash
cd ..
ls video_to_narrative.py  # Should exist
ls venv/bin/python3  # Should exist
```

### 4. Run the App

```bash
npm run dev
```

Visit http://localhost:3000

## Features Implemented

✅ **Home Page**
- Animated hero with typewriter effect
- 3-step process visualization
- Testimonials section
- Footer with links

✅ **Upload Page**
- Drag & drop file upload
- File preview
- Rights agreement checkbox
- Authentication required

✅ **Processing Page**
- Animated book icon that fills up
- Typewriter status text
- Progress bar
- Chunk progress counter
- Fun facts carousel
- Estimated time remaining

✅ **Result Page**
- Confetti celebration
- Book title display
- Download buttons (TXT, PDF, EPUB)
- Copy to clipboard
- Share link
- Convert another button

✅ **Authentication**
- Sign up / Sign in pages
- Email/password auth via Supabase
- Protected routes

✅ **Legal Pages**
- Terms of Service
- Privacy Policy

✅ **API Routes**
- `/api/upload` - Handles video upload
- `/api/status` - Returns processing status
- `/api/result` - Returns completed narrative
- `/api/download-epub` - Generates EPUB file

✅ **Database Integration**
- Jobs table for tracking processing
- Books table for storing narratives
- Row Level Security (RLS) policies
- User-specific data access

## Next Steps

1. **Customize Branding**
   - Update colors in `tailwind.config.ts`
   - Add your logo/favicon
   - Update meta tags in `app/layout.tsx`

2. **Deploy**
   - Deploy to Vercel (recommended)
   - Add environment variables
   - Ensure Python script is accessible

3. **Optional Enhancements**
   - Add email notifications
   - Add payment processing
   - Add book library page
   - Add social sharing features

## Troubleshooting

**"Unauthorized" errors:**
- Make sure you're signed in
- Check Supabase credentials in `.env.local`

**Upload not working:**
- Check file size (max 500MB)
- Verify Python script path is correct
- Check server logs for errors

**Database errors:**
- Make sure schema.sql was run in Supabase
- Verify RLS policies are enabled
- Check Supabase logs

## Support

For issues or questions, check the README.md or Supabase documentation.
