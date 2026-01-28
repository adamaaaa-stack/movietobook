#!/bin/bash

# Railway Deployment Script for Movie2Book
# This script helps you deploy to Railway via CLI

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚂 Railway Deployment Script${NC}"
echo "================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    echo ""
    echo "Installing Railway CLI..."
    curl -fsSL https://railway.app/install.sh | sh
    echo ""
    echo -e "${GREEN}✅ Railway CLI installed${NC}"
    echo ""
fi

# Check if logged in
echo "Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in. Please log in:${NC}"
    railway login
fi

echo -e "${GREEN}✅ Authenticated as: $(railway whoami)${NC}"
echo ""

# Check if project is linked
if [ ! -f "railway.toml" ] && [ ! -f ".railway" ]; then
    echo -e "${YELLOW}⚠️  Project not linked to Railway${NC}"
    echo "Choose an option:"
    echo "1) Create new Railway project"
    echo "2) Link to existing project"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" == "1" ]; then
        railway init
    else
        railway link
    fi
else
    echo -e "${GREEN}✅ Project linked${NC}"
fi

echo ""
echo "Current Railway status:"
railway status
echo ""

# Ask about environment variables
read -p "Do you want to set environment variables now? (y/n): " set_vars

if [ "$set_vars" == "y" ]; then
    echo ""
    echo "Setting up environment variables..."
    echo ""
    
    # Supabase (from .env.local if exists)
    if [ -f "movie2book/.env.local" ]; then
        source movie2book/.env.local
        if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
            railway variables set NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
            echo -e "${GREEN}✅ Set NEXT_PUBLIC_SUPABASE_URL${NC}"
        fi
        if [ ! -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
            railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
            echo -e "${GREEN}✅ Set NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
        fi
    fi
    
    # OpenAI API Key
    read -p "Enter OPENAI_API_KEY (or press Enter to skip): " OPENAI_KEY
    if [ ! -z "$OPENAI_KEY" ]; then
        railway variables set OPENAI_API_KEY="$OPENAI_KEY"
        echo -e "${GREEN}✅ Set OPENAI_API_KEY${NC}"
    fi
    
    # Lemon Squeezy (optional)
    read -p "Do you want to set Lemon Squeezy variables? (y/n): " set_lemon
    if [ "$set_lemon" == "y" ]; then
        read -p "Enter LEMONSQUEEZY_API_KEY: " LEMON_API_KEY
        read -p "Enter LEMONSQUEEZY_STORE_ID: " LEMON_STORE_ID
        read -p "Enter LEMONSQUEEZY_VARIANT_ID: " LEMON_VARIANT_ID
        read -p "Enter LEMONSQUEEZY_WEBHOOK_SECRET (optional): " LEMON_WEBHOOK
        
        if [ ! -z "$LEMON_API_KEY" ]; then
            railway variables set LEMONSQUEEZY_API_KEY="$LEMON_API_KEY"
            echo -e "${GREEN}✅ Set LEMONSQUEEZY_API_KEY${NC}"
        fi
        if [ ! -z "$LEMON_STORE_ID" ]; then
            railway variables set LEMONSQUEEZY_STORE_ID="$LEMON_STORE_ID"
            echo -e "${GREEN}✅ Set LEMONSQUEEZY_STORE_ID${NC}"
        fi
        if [ ! -z "$LEMON_VARIANT_ID" ]; then
            railway variables set LEMONSQUEEZY_VARIANT_ID="$LEMON_VARIANT_ID"
            echo -e "${GREEN}✅ Set LEMONSQUEEZY_VARIANT_ID${NC}"
        fi
        if [ ! -z "$LEMON_WEBHOOK" ]; then
            railway variables set LEMONSQUEEZY_WEBHOOK_SECRET="$LEMON_WEBHOOK"
            echo -e "${GREEN}✅ Set LEMONSQUEEZY_WEBHOOK_SECRET${NC}"
        fi
    fi
    
    # App config
    railway variables set PORT=3000
    railway variables set NODE_ENV=production
    echo -e "${GREEN}✅ Set PORT and NODE_ENV${NC}"
fi

echo ""
echo -e "${BLUE}Ready to deploy!${NC}"
echo ""
read -p "Deploy now? (y/n): " deploy_now

if [ "$deploy_now" == "y" ]; then
    echo ""
    echo -e "${YELLOW}🚀 Deploying to Railway...${NC}"
    echo ""
    railway up
    
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo "Getting your deployment URL..."
    DOMAIN=$(railway domain 2>/dev/null || echo "Check Railway dashboard")
    echo ""
    echo -e "${GREEN}Your app is live at: ${DOMAIN}${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update EXTERNAL_API_URL: railway variables set EXTERNAL_API_URL=https://your-domain.up.railway.app"
    echo "2. Update Lemon Squeezy webhook URL to: https://your-domain.up.railway.app/api/webhook/lemonsqueezy"
    echo "3. View logs: railway logs"
    echo ""
else
    echo ""
    echo "To deploy later, run:"
    echo "  railway up"
    echo ""
fi
