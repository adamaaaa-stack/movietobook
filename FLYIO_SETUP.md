# Fly.io Free Deployment Guide

## 🎯 Why Fly.io?

**Free Tier Benefits:**
- ✅ **No sleep** - Always on (unlike Render)
- ✅ **3 shared-cpu VMs** - Enough for your API
- ✅ **3GB persistent volumes** - Store uploads/outputs
- ✅ **160GB outbound data** - Plenty for video processing
- ✅ **Global edge deployment** - Fast worldwide
- ✅ **Docker-based** - Full control

**Limitations:**
- ⚠️ Requires Dockerfile (I'll create one)
- ⚠️ Slightly more complex setup than Render
- ⚠️ Free tier has resource limits (but enough for your use case)

---

## Quick Setup (10 minutes)

### Step 1: Install Fly CLI

**macOS:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Or with Homebrew:**
```bash
brew install flyctl
```

**Verify:**
```bash
fly version
```

### Step 2: Sign Up / Login

```bash
fly auth signup
# Or if you have an account:
fly auth login
```

### Step 3: Initialize Fly App

```bash
cd /Users/oogy/Documents/movietobook
fly launch
```

This will:
- Create a `fly.toml` config file
- Ask you to name your app (e.g., `movietobook-api`)
- Choose a region (pick closest to you)
- Create the app on Fly.io

### Step 4: Deploy

```bash
fly deploy
```

That's it! Your API will be live at: `https://your-app.fly.dev`

### Step 5: Set Environment Variables

```bash
fly secrets set OPENAI_API_KEY=your_key
fly secrets set NEXT_PUBLIC_SUPABASE_URL=your_url
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
# Add all other env vars
```

### Step 6: Get Your App URL

```bash
fly status
# Or check: https://fly.io/dashboard
```

---

## Cost: $0/month ✅

| Resource | Free Tier | Your Usage |
|----------|-----------|------------|
| **VMs** | 3 shared-cpu | 1 VM ✅ |
| **Persistent Volumes** | 3GB | ~1GB ✅ |
| **Outbound Data** | 160GB/month | ~10-20GB ✅ |
| **Total** | | **$0/month** 🎉 |

---

## Advantages Over Render

| Feature | Render Free | Fly.io Free |
|---------|-------------|-------------|
| **Always On** | ❌ Sleeps after 15min | ✅ Always on |
| **Cold Start** | ⚠️ ~30s after sleep | ✅ Instant |
| **Persistent Storage** | ❌ Ephemeral | ✅ 3GB volumes |
| **Setup Complexity** | ✅ Easy | ⚠️ Medium |
| **Docker Support** | ⚠️ Limited | ✅ Full support |

---

## Fly.io vs Render

**Choose Fly.io if:**
- ✅ You want no cold starts
- ✅ You need persistent storage
- ✅ You want always-on service
- ✅ You're comfortable with Docker

**Choose Render if:**
- ✅ You want the easiest setup
- ✅ You don't mind cold starts
- ✅ You prefer YAML config over Docker

**Both are FREE!** 🎉

---

## Troubleshooting

### Build Fails:
```bash
# Check logs
fly logs

# Rebuild
fly deploy --verbose
```

### App Won't Start:
```bash
# Check status
fly status

# View logs
fly logs

# SSH into container
fly ssh console
```

### Out of Memory:
```bash
# Check memory usage
fly status

# Scale up (if needed, but free tier should be enough)
fly scale memory 512
```

### Persistent Volume Issues:
```bash
# List volumes
fly volumes list

# Create volume if needed
fly volumes create data --size 1
```

---

## Next Steps

1. ✅ I'll create `Dockerfile` for Fly.io
2. ✅ I'll create `fly.toml` config
3. ⏭️ Deploy to Fly.io
4. ⏭️ Update Vercel to use Fly.io API

---

## Comparison Summary

| Option | Cost | Always On | Setup | Best For |
|-------|------|-----------|-------|----------|
| **Fly.io** | Free ✅ | Yes ✅ | Medium | Production-ready |
| **Render** | Free ✅ | No ⚠️ | Easy | Quick setup |
| **Railway** | $5/month | Yes ✅ | Easy | Paid option |

**Recommendation:** Fly.io for free + always-on, Render for easiest setup.
