# Quick Start: Fly.io Deployment (5 minutes)

## 🚀 Deploy in 5 Steps

### 1. Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

Or with Homebrew:
```bash
brew install flyctl
```

### 2. Sign Up / Login
```bash
fly auth signup
# Follow the prompts to create account
```

### 3. Deploy
```bash
cd /Users/oogy/Documents/movietobook
fly launch
```

**When prompted:**
- App name: `movietobook-api` (or any name)
- Region: Choose closest to you (e.g., `iad` for US East)
- Postgres: No (we use Supabase)
- Redis: No

### 4. Set Environment Variables
```bash
fly secrets set OPENAI_API_KEY=your_openai_key
fly secrets set NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
# Add all other env vars from .env
```

### 5. Get Your URL
```bash
fly status
# Your API will be at: https://movietobook-api.fly.dev
```

**That's it!** Your API is live! 🎉

---

## Update Vercel

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   ```
   EXTERNAL_API_URL=https://movietobook-api.fly.dev
   ```
3. Redeploy Vercel

---

## Verify It Works

```bash
# Test health endpoint
curl https://movietobook-api.fly.dev/health

# Should return: {"status":"ok","service":"video-processing-api"}
```

---

## Useful Commands

```bash
# View logs
fly logs

# Check status
fly status

# SSH into container
fly ssh console

# Restart app
fly apps restart movietobook-api

# View secrets
fly secrets list
```

---

## Troubleshooting

### Build fails:
```bash
fly logs
# Check the error message
```

### App won't start:
```bash
fly status
fly logs
# Check for errors
```

### Out of memory:
```bash
# Check current usage
fly status

# Free tier gives 512MB, should be enough
# If needed, you can scale (but that costs money)
```

---

## Why Fly.io?

✅ **Always on** - No cold starts  
✅ **Free** - $0/month  
✅ **Persistent** - Files survive restarts  
✅ **Fast** - Global edge network  

Perfect for production! 🚀
