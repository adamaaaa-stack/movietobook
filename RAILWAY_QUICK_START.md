# Railway Quick Start 🚂

## Deploy in 3 Commands!

### 1. Install & Login
```bash
npm i -g @railway/cli
railway login
```

### 2. Initialize
```bash
cd /Users/oogy/Documents/movietobook
railway init
```

### 3. Deploy!
```bash
railway up
```

**Done!** 🎉

---

## Set Environment Variables

**Via CLI:**
```bash
railway variables set OPENAI_API_KEY=your_key
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
railway variables set EXTERNAL_API_URL=http://localhost:8080
# Add all other vars
```

**Or via Dashboard:**
- Go to railway.app → Your project → Variables

---

## Get Your URL

```bash
railway domain
```

Or check Railway dashboard!

---

## That's It!

Railway uses `railway.json` automatically - everything is configured! 🚂
