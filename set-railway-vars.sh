#!/bin/bash

# Set Railway environment variables
# Run this after linking your service

cd /Users/oogy/Documents/movietobook

echo "Setting Railway environment variables..."

# Supabase
railway variables set NEXT_PUBLIC_SUPABASE_URL="https://iubzlvifqarwuylbhyup.supabase.co"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnpsdmlmcWFyd3V5bGJoeXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mjg3NTgsImV4cCI6MjA4NTEwNDc1OH0.HhRAWPj0UW_ij2EBH625baOXJjG1ZoAUSUQuswxmdH8"

# OpenAI (replace with your actual key)
railway variables set OPENAI_API_KEY="your_openai_api_key_here"

# App config
railway variables set PORT=3000
railway variables set NODE_ENV=production

# Lemon Squeezy (placeholders - update these later)
railway variables set LEMONSQUEEZY_API_KEY="your_api_key_here"
railway variables set LEMONSQUEEZY_STORE_ID="your_store_id"
railway variables set LEMONSQUEEZY_VARIANT_ID="your_variant_id"
railway variables set LEMONSQUEEZY_WEBHOOK_SECRET="your_webhook_secret"

echo "✅ Environment variables set!"
echo ""
echo "Note: Update Lemon Squeezy variables with real values when ready:"
echo "  railway variables set LEMONSQUEEZY_API_KEY=your_real_key"
echo "  railway variables set LEMONSQUEEZY_STORE_ID=your_real_store_id"
echo "  railway variables set LEMONSQUEEZY_VARIANT_ID=your_real_variant_id"
echo "  railway variables set LEMONSQUEEZY_WEBHOOK_SECRET=your_real_secret"
