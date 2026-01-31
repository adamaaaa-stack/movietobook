#!/bin/bash
# Commit Gumroad changes and push. Run from repo root: ./commit-and-push.sh
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock
git add -A
git status
git commit -m "Gumroad license key verification: subscribe page, verify API, session cookie, middleware, dashboard"
git push
echo "Done."
