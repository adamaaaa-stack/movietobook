#!/bin/bash
# Run this in your terminal to push the thanks page to GitHub
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock 2>/dev/null
git add movie2book/app/thanks movie2book/app/api/checkout/route.ts
git commit -m "Add /thanks page and PayPal return URL"
git push origin main
echo "Done. Render will auto-deploy if connected to GitHub."
