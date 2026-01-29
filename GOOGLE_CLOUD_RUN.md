# Deploy Movie2Book on Google Cloud Run

Host the full stack (Python backend + Next.js frontend) on **Google Cloud Run**. You get a public URL like `https://movietobook-xxxxx.run.app`.

## Prerequisites

- **Google Cloud account** (free tier available)
- **gcloud CLI** installed: https://cloud.google.com/sdk/docs/install
- **Docker** (optional; Cloud Run can build from source)

## 1. One-time setup

### Install gcloud and log in

```bash
# Install gcloud (see link above), then:
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Enable APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

## 2. Deploy from source (recommended)

From your project root (where `Dockerfile` is):

```bash
cd /Users/oogy/Documents/movietobook

# Build and deploy in one step (Cloud Build uses your Dockerfile)
gcloud run deploy movietobook \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "EXTERNAL_API_URL=http://localhost:8081" \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600
```

When prompted for **build** (first time), choose **Yes** to use Cloud Build.

### Add your env vars

Add Supabase, PayPal, and any build args in the same command or in the Console:

```bash
gcloud run deploy movietobook \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "EXTERNAL_API_URL=http://localhost:8081" \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key" \
  --set-env-vars "PAYPAL_CLIENT_ID=your_client_id" \
  --set-env-vars "PAYPAL_CLIENT_SECRET=your_secret" \
  --set-env-vars "PAYPAL_MODE=sandbox" \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600
```

For **build-time** vars (Supabase for Next.js build), use **build flags** in `gcloud run deploy`:

```bash
gcloud run deploy movietobook \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,EXTERNAL_API_URL=http://localhost:8081,..." \
  --set-build-env-vars "NEXT_PUBLIC_SUPABASE_URL=...,NEXT_PUBLIC_SUPABASE_ANON_KEY=..." \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600
```

Or set **env vars in the Console** after first deploy: **Cloud Run → movietobook → Edit & deploy → Variables & secrets**.

## 3. Port behavior

- **Cloud Run** sets `PORT=8080`. The app uses it for **Next.js** (the main entrypoint).
- The **Python API** runs on **8081** inside the container so it doesn’t conflict.
- `EXTERNAL_API_URL=http://localhost:8081` tells the Next.js server to call the Python backend on 8081.

## 4. After deploy

- Your service URL: **https://movietobook-xxxxx-uc.a.run.app** (or the URL shown in the console).
- Open it in a browser; sign in and use the app as on Render.
- **Webhooks** (e.g. PayPal): set the webhook URL to  
  `https://YOUR_CLOUD_RUN_URL/api/webhook/paypal`.

## 5. Update / redeploy

```bash
cd /Users/oogy/Documents/movietobook
gcloud run deploy movietobook --source . --region us-central1
```

## 6. Optional: custom domain

1. **Cloud Run** → your service → **Manage custom domains**.
2. Add your domain and follow DNS instructions (often via **Load balancing** or **Domain mapping**).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails (Node / npm) | Ensure Dockerfile and `movie2book` layout match repo; check Cloud Build logs. |
| 503 / timeout | Increase **Memory** (e.g. 2Gi) and **Timeout** (e.g. 3600). |
| Upload / processing fails | Confirm `EXTERNAL_API_URL=http://localhost:8081` is set and Python API starts (check logs). |
| Env vars not in Next.js | Use **set-build-env-vars** for `NEXT_PUBLIC_*` or set them in Dockerfile `ARG`/`ENV` and redeploy. |

## Cost (rough)

- **Cloud Run**: free tier includes many requests/month; then pay per request and CPU/memory time.
- **Cloud Build**: free tier includes 120 build-minutes/day.
- See: https://cloud.google.com/run/pricing and https://cloud.google.com/build/pricing
