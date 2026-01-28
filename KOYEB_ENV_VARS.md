# Koyeb Environment Variables Guide 🔐

## Quick Answer

**For Koyeb deployment:**
- ❌ **Don't upload `.env` file**
- ✅ **Set environment variables in Koyeb dashboard**

---

## What Environment Variables Koyeb Needs

### Required Variables:

```
OPENAI_API_KEY=your_openai_key
PORT=8080
```

### Optional Variables (if your Python script needs them):

```
NEXT_PUBLIC_SUPABASE_URL=your_url (if Python script accesses Supabase)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key (if Python script accesses Supabase)
```

---

## How to Set Environment Variables in Koyeb

### Step 1: Go to Your App
1. Login to https://www.koyeb.com
2. Click on your app (`movietobook-api` or whatever you named it)
3. Go to "Variables" tab (or "Environment Variables")

### Step 2: Add Variables
1. Click "Add Variable" or "+" button
2. Enter:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...` (your actual key)
3. Click "Add" or "Save"
4. Repeat for each variable

### Step 3: Redeploy (if app is already running)
- After adding variables, Koyeb will auto-redeploy
- Or click "Redeploy" button manually

---

## Complete List for Koyeb

### Minimum Required:
```
OPENAI_API_KEY=your_openai_key_here
PORT=8080
```

### If Python Script Needs Supabase:
```
OPENAI_API_KEY=your_key
PORT=8080
NEXT_PUBLIC_SUPABASE_URL=https://iubzlvifqarwuylbhyup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Important Notes

### ✅ DO:
- Set variables in Koyeb dashboard
- Use exact variable names (case-sensitive)
- Keep values secret (don't share)

### ❌ DON'T:
- Upload `.env` file to Koyeb
- Commit `.env` to GitHub
- Share your API keys publicly

---

## How Python Script Reads Variables

Your `api_server.py` and `video_to_narrative.py` use:

```python
import os
from dotenv import load_dotenv

# This loads from .env file (local) or environment variables (Koyeb)
load_dotenv()

# Reads from environment (works in both local and Koyeb)
api_key = os.environ.get('OPENAI_API_KEY')
```

**Koyeb automatically injects environment variables**, so `os.environ.get()` will work!

---

## Step-by-Step: Setting Variables in Koyeb

### Method 1: During App Creation
1. Create new app
2. Connect GitHub repo
3. Before clicking "Deploy", scroll to "Environment Variables"
4. Click "Add Variable"
5. Add all variables
6. Click "Deploy"

### Method 2: After App is Created
1. Go to your app dashboard
2. Click "Variables" tab (left sidebar)
3. Click "Add Variable" or "+"
4. Enter name and value
5. Click "Add"
6. App will auto-redeploy

---

## Quick Checklist

**For Koyeb Backend:**
- [ ] `OPENAI_API_KEY` set in Koyeb dashboard
- [ ] `PORT=8080` set (optional, Koyeb provides this)
- [ ] `.env` file NOT uploaded ✅
- [ ] Variables are secret (not visible in logs)

**For Vercel Frontend:**
- [ ] `EXTERNAL_API_URL` set to Koyeb URL
- [ ] All Supabase vars set
- [ ] All Lemon Squeezy vars set
- [ ] `.env.local` file NOT uploaded ✅

---

## Troubleshooting

### "OPENAI_API_KEY not found" error:
- ✅ Check variable is set in Koyeb dashboard
- ✅ Check spelling (case-sensitive)
- ✅ Redeploy app after adding variables

### Variables not working:
- ✅ Make sure you clicked "Add" after entering
- ✅ Check app logs in Koyeb dashboard
- ✅ Verify variable names match exactly

### How to check if variables are set:
1. Go to Koyeb app dashboard
2. Click "Variables" tab
3. You'll see all set variables (values are hidden for security)

---

## Summary

**For Koyeb:**
- ✅ Set `OPENAI_API_KEY` in dashboard
- ✅ Set `PORT=8080` (optional)
- ❌ Don't upload `.env` file
- ✅ Variables are automatically available to Python script

**Your Python code will work automatically** - `os.environ.get()` reads from Koyeb's environment variables! 🎉
