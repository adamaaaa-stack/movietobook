#!/bin/bash

# Lemon Squeezy Setup Script for Movie2Book
# This script helps you set up Lemon Squeezy environment variables

set -e

echo "🎬 Movie2Book - Lemon Squeezy Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating $ENV_FILE file..."
    touch "$ENV_FILE"
fi

echo "Please enter your Lemon Squeezy credentials:"
echo ""

# Get API Key
read -p "1. Enter your LEMONSQUEEZY_API_KEY: " API_KEY
if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ API Key is required${NC}"
    exit 1
fi

# Get Store ID
read -p "2. Enter your LEMONSQUEEZY_STORE_ID: " STORE_ID
if [ -z "$STORE_ID" ]; then
    echo -e "${RED}❌ Store ID is required${NC}"
    exit 1
fi

# Get Variant ID
read -p "3. Enter your LEMONSQUEEZY_VARIANT_ID: " VARIANT_ID
if [ -z "$VARIANT_ID" ]; then
    echo -e "${RED}❌ Variant ID is required${NC}"
    exit 1
fi

# Get Webhook Secret (optional for local dev)
read -p "4. Enter your LEMONSQUEEZY_WEBHOOK_SECRET (optional, press Enter to skip): " WEBHOOK_SECRET

echo ""
echo "📝 Writing to $ENV_FILE..."

# Remove existing Lemon Squeezy vars if they exist
sed -i.bak '/^LEMONSQUEEZY_/d' "$ENV_FILE" 2>/dev/null || sed -i '' '/^LEMONSQUEEZY_/d' "$ENV_FILE" 2>/dev/null

# Add new vars
echo "" >> "$ENV_FILE"
echo "# Lemon Squeezy Configuration" >> "$ENV_FILE"
echo "LEMONSQUEEZY_API_KEY=$API_KEY" >> "$ENV_FILE"
echo "LEMONSQUEEZY_STORE_ID=$STORE_ID" >> "$ENV_FILE"
echo "LEMONSQUEEZY_VARIANT_ID=$VARIANT_ID" >> "$ENV_FILE"
if [ ! -z "$WEBHOOK_SECRET" ]; then
    echo "LEMONSQUEEZY_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> "$ENV_FILE"
fi

# Clean up backup file
rm -f "$ENV_FILE.bak" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Lemon Squeezy environment variables added to $ENV_FILE${NC}"
echo ""
echo "Next steps:"
echo "1. Review $ENV_FILE to verify the values"
echo "2. Run the Supabase migration: supabase_migration_lemonsqueezy.sql"
echo "3. Test the checkout flow: npm run dev"
echo ""
echo "For detailed setup instructions, see: LEMONSQUEEZY_CLI_SETUP.md"
