#!/bin/bash

# Set Railway environment variables with YOUR actual values
# Run this AFTER linking your service: railway service

cd /Users/oogy/Documents/movietobook

echo "Setting Railway environment variables with your actual values..."

# Supabase
railway variables set NEXT_PUBLIC_SUPABASE_URL="https://iubzlvifqarwuylbhyup.supabase.co"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnpsdmlmcWFyd3V5bGJoeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg3NTgsImV4cCI6MjA4NTEwNDc1OH0.HhRAWPj0UW_ij2EBH625baOXJjG1ZoAUSUQuswxmdH8"

# OpenAI (replace with your actual key)
read -p "Enter your OPENAI_API_KEY: " OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then
    railway variables set OPENAI_API_KEY="$OPENAI_KEY"
fi

# App config
railway variables set PORT=3000
railway variables set NODE_ENV=production

# Lemon Squeezy (placeholders - update these when you set up Lemon Squeezy)
railway variables set LEMONSQUEEZY_API_KEY="your_api_key_here"
railway variables set LEMONSQUEEZY_STORE_ID="your_store_id"
railway variables set LEMONSQUEEZY_VARIANT_ID="your_variant_id"
railway variables set LEMONSQUEEZY_WEBHOOK_SECRET="your_webhook_secret"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "Next steps:"
echo "1. Wait for deployment to complete: railway logs"
echo "2. Get your domain: railway domain"
echo "3. Update EXTERNAL_API_URL: railway variables set EXTERNAL_API_URL=https://your-domain.up.railway.app"
echo "4. Update Lemon Squeezy variables when ready"
