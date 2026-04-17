#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-car-marketplace-ar}"
REGION="${2:-us-central1}"

if ! command -v firebase >/dev/null 2>&1; then
  echo "firebase CLI is required. Install: npm i -g firebase-tools"
  exit 1
fi

echo "Creating/Selecting Firebase project: ${PROJECT_ID}"
firebase projects:create "${PROJECT_ID}" --display-name "Car Marketplace AR" || true
firebase use "${PROJECT_ID}" --add

echo "Enabling Firebase services"
firebase firestore:databases:create --location="${REGION}" || true
firebase apps:create WEB "car-marketplace-ar-web" || true

echo "Deploying rules and indexes"
firebase deploy --only firestore:rules,firestore:indexes,storage

echo "Done. Next steps:"
echo "1) Enable Authentication providers in Firebase Console"
echo "2) Create service account and export FIREBASE_* env vars"
echo "3) Set NEXT_PUBLIC_FIREBASE_* env vars from web app config"
