# Production Deployment - Quick Start 🚀

## Deploy to Production in 5 Steps

### 1. Create Production Environment
```bash
railway environment create production
railway environment use production
```

### 2. Set Production Variables
```bash
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=your_key
railway variables set EXTERNAL_API_URL=http://localhost:8080
# Add all other vars
```

### 3. Deploy
```bash
railway up
```

### 4. Get Production URL
```bash
railway domain
```

### 5. Enable Auto-Deploy (Optional)
- Dashboard → Settings → GitHub
- Connect repo → Enable auto-deploy
- Select `production` environment

**Done!** 🎉

---

## Production Features

✅ **Auto-builds** Next.js on deploy  
✅ **Production mode** - Optimized  
✅ **HTTPS** - Automatic SSL  
✅ **Custom domain** - Optional  
✅ **Auto-deploy** - From GitHub  

---

## What's Different in Production?

- ✅ Next.js is built (`npm run build`)
- ✅ Uses `npm start` (production server)
- ✅ Optimized performance
- ✅ Better error handling
- ✅ Production logging

---

## Monitor Production

```bash
# View logs
railway logs --environment production

# Check status
railway status

# View metrics
# Go to Railway dashboard → Metrics
```

---

## That's It!

Your app is now in production! 🚀
