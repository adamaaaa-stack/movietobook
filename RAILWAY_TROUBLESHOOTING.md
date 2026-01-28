# Railway Deployment Troubleshooting

## Issue: Deployment Stuck on "Queued"

If your Railway deployment is stuck in "Queued" status, try these solutions:

### Solution 1: Check Railway Dashboard
1. Open Railway dashboard: `railway open`
2. Go to your service → Deployments tab
3. Check if there are any error messages or resource limits

### Solution 2: Cancel and Redeploy
```bash
# Cancel current deployment (if possible in dashboard)
# Then redeploy
railway up
```

### Solution 3: Check Free Tier Limits
Railway free tier has limits:
- Build time limits
- Concurrent builds
- Resource constraints

If you hit limits:
- Wait a few minutes and try again
- Consider upgrading to Railway Pro ($5/month) for faster builds

### Solution 4: Try Nixpacks Instead of Dockerfile
Nixpacks might build faster. Update `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "sh start.sh",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Solution 5: Simplify Dockerfile
The current Dockerfile builds both Python and Node.js. This can be slow.

**Option A: Split into two services** (recommended for production)
- Service 1: Python API (port 8080)
- Service 2: Next.js Frontend (port 3000)

**Option B: Use Railway's native buildpacks**
- Let Railway detect and build automatically
- Remove Dockerfile, use Nixpacks

### Solution 6: Check Build Logs
```bash
# View recent build logs
railway logs --build

# View service logs
railway logs

# Stream logs in real-time
railway logs --follow
```

### Solution 7: Restart Service
```bash
# Restart the service
railway service restart

# Or redeploy
railway redeploy
```

### Solution 8: Check Resource Usage
In Railway dashboard:
1. Go to your service
2. Check "Metrics" tab
3. Look for CPU/Memory limits
4. Free tier: 512MB RAM, 1GB storage

### Solution 9: Optimize Dockerfile
Current Dockerfile builds everything. Try:
1. Use multi-stage builds
2. Cache dependencies better
3. Reduce image size

### Solution 10: Contact Railway Support
If nothing works:
- Railway Discord: https://discord.gg/railway
- Railway Support: support@railway.app

## Quick Fixes

### Force Redeploy
```bash
# Make a small change to trigger rebuild
echo "# $(date)" >> README.md
git add README.md
git commit -m "Trigger rebuild"
git push origin main
railway up
```

### Check Service Health
```bash
# Check if service is running
railway status

# Get service URL
railway domain

# Test endpoint
curl https://your-app.up.railway.app
```

## Common Issues

### Build Timeout
- Free tier: 10-15 min build limit
- Solution: Optimize Dockerfile or upgrade

### Out of Memory
- Free tier: 512MB RAM
- Solution: Reduce dependencies or upgrade

### Port Conflicts
- Railway assigns PORT automatically
- Solution: Use `process.env.PORT` in your app

### Missing Environment Variables
```bash
# Check variables
railway variables

# Set missing ones
railway variables set KEY=value
```
