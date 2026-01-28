# Railway Deployment Guide

## Quick Setup

### 1. Install Railway CLI
```bash
npm i -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Initialize Project
```bash
cd /Users/oogy/Documents/movietobook
railway init
```

### 4. Set Environment Variables
```bash
railway variables set OPENAI_API_KEY=your_key
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
# Add all other env vars from .env
```

### 5. Deploy
```bash
railway up
```

### 6. Get Your API URL
```bash
railway domain
```
This gives you something like: `https://your-app.up.railway.app`

## Update Vercel API Routes

After deploying to Railway, update your Vercel API routes to call the Railway API instead of running Python directly.

### Example: Update `/app/api/upload/route.ts`

```typescript
// Instead of spawning Python process, call Railway API
const response = await fetch(`${process.env.RAILWAY_API_URL}/api/process-video`, {
  method: 'POST',
  body: formData,
});

const { job_id } = await response.json();
```

## Environment Variables Needed

Add to Railway:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` (if needed)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if needed)
- Any other vars your Python script needs

Add to Vercel:
- `RAILWAY_API_URL=https://your-app.up.railway.app`
- All Supabase vars
- All Lemon Squeezy vars

## Cost

Railway pricing:
- **Free trial:** $5 credit
- **Hobby plan:** $5/month + usage
- **Pro plan:** $20/month + usage

For moderate usage: ~$5-10/month

## Benefits

✅ Full Python 3.11+ support  
✅ FFmpeg available  
✅ Auto-deploys from GitHub  
✅ Easy environment variables  
✅ Built-in logging  
✅ Custom domains  
