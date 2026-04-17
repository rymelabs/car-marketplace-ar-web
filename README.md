# Car Marketplace AR (Web-First)

A Next.js + Firebase marketplace for cars where buyers can inspect listings and launch a true-scale AR preview from the vehicle detail page before submitting a purchase inquiry.

## Features (V1)
- Browse/search/sort car listings.
- Car detail pages with specs, media, and AR section.
- True-scale AR eligibility checks based on model QA and dimensions.
- Inquiry submission workflow (lead-gen, no checkout).
- Admin portal for listing updates, model moderation, and publish control.
- Firestore + Storage security rules.
- Netlify deployment config and Firebase setup scripts.

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Firebase Auth, Firestore, Storage, Functions-ready setup
- Netlify deployment (`netlify.toml`)
- Zod validation
- Vitest + Playwright test setup

## Local Development
1. Install dependencies:
```bash
npm install
```

2. Copy environment template:
```bash
cp .env.example .env.local
```

3. Start development server:
```bash
npm run dev
```

4. Open `http://localhost:3000`

> Default local mode uses in-memory seed data with demo admin bypass enabled (`DEMO_ADMIN_BYPASS=true`).

## Firebase Project Setup

Create and configure Firebase project `car-marketplace-ar`:

```bash
./scripts/setup-firebase.sh car-marketplace-ar us-central1
```

Then in Firebase Console:
- Enable Authentication providers (email/password at minimum).
- Create web app config and set `NEXT_PUBLIC_FIREBASE_*` variables.
- Create service account key and set server env vars (`FIREBASE_*`).
- Assign custom claim `role=admin` to admin users for production authorization model.

## Netlify Project Setup

Create and link Netlify site `car-marketplace-ar-web`:

```bash
./scripts/setup-netlify.sh car-marketplace-ar-web
```

Then in Netlify:
- Add environment variables from `.env.example`.
- Connect repository for preview + production deployments.
- Trigger deploy.

## Useful Scripts
- `npm run dev` - local dev server
- `npm run lint` - linting
- `npm run test` - unit tests
- `npm run test:e2e` - Playwright e2e tests
- `npm run build` - production build

## Repository Notes
- Product and execution documentation:
  - `docs/app-description.md`
  - `docs/implementation-plan.md`
  - `docs/operations-runbook.md`
- Firebase policy files:
  - `firestore.rules`
  - `firestore.indexes.json`
  - `storage.rules`
