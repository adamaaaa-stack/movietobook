# Vercel Deployment Guide

## Environment Variables

Add these environment variables in your Vercel dashboard (Settings > Environment Variables):

### Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID=your_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
OPENAI_API_KEY=your_openai_api_key
```

### Optional (for Python script):
```bash
PYTHON_PATH=/usr/bin/python3  # Or path to Python in Vercel
```

## Common 404 Issues

### 1. Missing Environment Variables
- Check Vercel Dashboard > Settings > Environment Variables
- Ensure all required variables are set
- Redeploy after adding variables

### 2. API Routes Not Found
- Ensure `vercel.json` is in the root directory
- Check that API routes are in `app/api/` directory
- Verify route exports are correct (`export async function GET/POST`)

### 3. Build Failures
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation passes

### 4. Python Script Issues
- The Python script (`video_to_narrative.py`) requires a serverless function or external service
- Consider moving video processing to a separate service (e.g., Railway, Render, or AWS Lambda)
- Or use Vercel Serverless Functions with Python runtime

## Troubleshooting Steps

1. **Check Build Logs**: Go to Vercel Dashboard > Deployments > [Latest] > Build Logs
2. **Check Function Logs**: Go to Vercel Dashboard > Deployments > [Latest] > Function Logs
3. **Verify Environment Variables**: Settings > Environment Variables
4. **Test API Routes Locally**: Run `npm run build && npm start` locally

## Python Processing Note

The video processing script requires:
- Python 3.11+
- FFmpeg
- OpenCV
- OpenAI Whisper

These are not available in Vercel's default Node.js runtime. Options:

1. **Use External Service**: Deploy Python script to Railway/Render and call it via API
2. **Use Vercel Serverless Functions**: Create Python functions (limited support)
3. **Use Edge Functions**: For lighter processing (not suitable for video)

## Recommended Architecture

```
Vercel (Next.js Frontend)
  ↓
External API (Railway/Render)
  ↓
Python Processing Script
```

This keeps the frontend fast and allows heavy processing on a dedicated server.
