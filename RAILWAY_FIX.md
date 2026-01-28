# Railway Service Re-link Fix

## Issue: "Failed to upload code with status code 404 Not Found"

The service needs to be re-linked to your Railway project.

## Solution:

Run this command and select your service:

```bash
cd /Users/oogy/Documents/movietobook
railway service
```

Then:
1. Select your workspace (adamaaaa-stack's Projects)
2. Select your project (Movie2Book)
3. Select your service (Movie2Book)

After linking, deploy again:

```bash
railway up
```

## Alternative: Link via Dashboard

1. Open Railway dashboard: `railway open`
2. Go to your project
3. Click on your service
4. Copy the service ID from the URL
5. Link via CLI: `railway service <service-id>`

## After Re-linking

Once the service is linked, the Dockerfile fix should work:
- ✅ Copies `app/` directory before building
- ✅ Copies all config files (next.config.ts, tsconfig.json, etc.)
- ✅ Builds Next.js successfully

Then deploy:
```bash
railway up
```
