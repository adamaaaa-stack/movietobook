# Railway Production Deployment Guide 🚀

## Deploy to Production on Railway

---

## Step 1: Create Production Environment

### Via CLI:
```bash
railway environment create production
railway environment use production
```

### Via Dashboard:
1. Go to railway.app → Your project
2. Click "Environments" → "New Environment"
3. Name: `production`
4. Click "Create"

---

## Step 2: Set Production Environment Variables

### Via CLI:
```bash
railway variables set OPENAI_API_KEY=your_production_key --environment production
railway variables set PORT=8080 --environment production
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url --environment production
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key --environment production
railway variables set LEMONSQUEEZY_API_KEY=your_key --environment production
railway variables set LEMONSQUEEZY_STORE_ID=your_id --environment production
railway variables set LEMONSQUEEZY_VARIANT_ID=your_id --environment production
railway variables set EXTERNAL_API_URL=http://localhost:8080 --environment production
railway variables set NODE_ENV=production --environment production
```

### Via Dashboard:
1. Go to railway.app → Your project
2. Select "production" environment
3. Variables tab → Add Variable
4. Add all variables above

---

## Step 3: Deploy to Production

### Via CLI:
```bash
railway up --environment production
```

### Via Dashboard:
1. Select "production" environment
2. Click "Deploy" or push to GitHub (if auto-deploy enabled)

---

## Step 4: Set Up Custom Domain

### Via CLI:
```bash
railway domain add yourdomain.com --environment production
```

### Via Dashboard:
1. Go to Settings → Networking
2. Click "Generate Domain" or "Add Custom Domain"
3. Follow DNS setup instructions

---

## Step 5: Production Optimizations

### Update `start.sh` for Production:

**Current (dev):**
```bash
npm run dev
```

**Production (should use):**
```bash
npm start  # Uses built version
```

### Update `railway.json`:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "sh start.sh",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Update `start.sh` for Production:

```bash
#!/bin/bash
# Production start script for Railway

echo "🚀 Starting Movie2Book (Production)..."

# Start Python API server in background
echo "📡 Starting Python API server on port 8080..."
python3 api_server.py &
API_PID=$!

# Wait for API to start
sleep 3

# Build Next.js for production (if not already built)
if [ ! -d "movie2book/.next" ]; then
  echo "🔨 Building Next.js for production..."
  cd movie2book
  npm run build
  cd ..
fi

# Start Next.js frontend (production mode)
echo "🌐 Starting Next.js frontend on port 3000..."
cd movie2book
npm start

# If frontend stops, kill API too
kill $API_PID 2>/dev/null
```

---

## Step 6: Enable Auto-Deploy from GitHub

### Via Dashboard:
1. Go to Settings → GitHub
2. Connect repository
3. Select branch: `main`
4. Select environment: `production`
5. Enable "Auto Deploy" ✅

**Now:** Push to `main` → Auto-deploys to production! 🚀

---

## Step 7: Set Up Monitoring

### Railway Built-in:
- ✅ Logs: `railway logs --environment production`
- ✅ Metrics: Dashboard → Metrics tab
- ✅ Alerts: Dashboard → Settings → Alerts

### External Monitoring (Optional):
- **UptimeRobot** - Free uptime monitoring
- **Sentry** - Error tracking
- **Logtail** - Log aggregation

---

## Production Checklist

- [ ] Production environment created
- [ ] All environment variables set
- [ ] Custom domain configured (optional)
- [ ] Auto-deploy enabled
- [ ] Monitoring set up
- [ ] SSL certificate (automatic with Railway)
- [ ] Production build tested
- [ ] Error tracking configured

---

## Production vs Development

| Setting | Development | Production |
|---------|-------------|------------|
| **Environment** | `development` | `production` |
| **NODE_ENV** | `development` | `production` |
| **Next.js** | `npm run dev` | `npm start` |
| **Build** | On-demand | Pre-built |
| **Logging** | Verbose | Essential only |
| **Domain** | Railway subdomain | Custom domain |

---

## Quick Production Deploy

```bash
# 1. Create production environment
railway environment create production

# 2. Switch to production
railway environment use production

# 3. Set variables
railway variables set NODE_ENV=production
# ... add all other vars

# 4. Deploy
railway up

# 5. Get URL
railway domain
```

---

## Production Best Practices

### 1. Use Production Builds
- Build Next.js before deploying
- Use `npm start` not `npm run dev`

### 2. Environment Variables
- Never commit secrets
- Use Railway's variable management
- Separate dev/prod variables

### 3. Monitoring
- Set up alerts
- Monitor logs regularly
- Track errors

### 4. Scaling
- Railway auto-scales
- Monitor resource usage
- Upgrade plan if needed

### 5. Security
- Use HTTPS (automatic)
- Keep dependencies updated
- Regular security audits

---

## Cost for Production

**Railway Pricing:**
- Starter: $5/month + usage
- Pro: $20/month + usage

**Estimated:** $5-15/month for moderate traffic

---

## Next Steps

1. ✅ Create production environment
2. ✅ Set production variables
3. ✅ Deploy to production
4. ✅ Set up custom domain
5. ✅ Enable monitoring
6. ✅ Test end-to-end

**Your app is production-ready!** 🎉
