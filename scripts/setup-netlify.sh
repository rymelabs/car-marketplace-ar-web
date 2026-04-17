#!/usr/bin/env bash
set -euo pipefail

SITE_NAME="${1:-car-marketplace-ar-web}"

if ! command -v netlify >/dev/null 2>&1; then
  echo "Netlify CLI is required. Install: npm i -g netlify-cli"
  exit 1
fi

if [ ! -d .git ]; then
  echo "Run this script from repository root with git initialized."
  exit 1
fi

echo "Creating Netlify site: ${SITE_NAME}"
netlify sites:create --name "${SITE_NAME}" || true

echo "Linking current repo to Netlify site"
netlify link --name "${SITE_NAME}"

echo "Setting build settings"
netlify api updateSite --data '{"build_settings":{"cmd":"npm run build","publish":".next"}}' >/dev/null || true

echo "Done. Next steps:"
echo "1) Set all environment variables from .env.example in Netlify UI/CLI"
echo "2) Connect Git provider for deploy previews"
echo "3) Trigger first deploy with: netlify deploy --build"
