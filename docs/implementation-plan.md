# Implementation Plan: Car Marketplace + True-Scale AR

## Summary
- Build a web-first marketplace with SEO-friendly car listings and detail pages.
- Use lead-generation commerce (inquiry flow) instead of direct checkout.
- Provide true-to-scale AR launch from each eligible detail page.
- Use Next.js + Firebase + Netlify with a built-in admin moderation portal.

## Implementation Plan

### 1. Foundation and Project Setup
- Bootstrap Next.js TypeScript app with App Router.
- Add design tokens and reusable layout/navigation components.
- Add Firebase SDKs, schema validation, and test tooling.
- Add deployment config for Netlify and backend config for Firebase.

### 2. Core Domain and Data Contracts
- Define shared TypeScript interfaces:
  - `CarListing`
  - `CarModelAsset`
  - `Inquiry`
  - `UserRole`
- Implement schema validators for API payloads.
- Build AR eligibility and scale-validation utility helpers.

### 3. Backend/API Layer
- Implement public APIs:
  - `GET /api/cars`
  - `GET /api/cars/:id`
  - `POST /api/inquiries`
- Implement admin APIs:
  - create/update listing
  - publish/unpublish listing with QA gate
  - approve/reject model uploads
- Add server-side auth/role checks and mutation validation.

### 4. Buyer Experience
- Listing browse/search/filter/sort UI.
- Car detail page with specs, media, dimensions, and AR section.
- Inquiry submission form with validation and success state.

### 5. AR + 3D Asset Workflow
- Integrate `@google/model-viewer` in detail page.
- Configure AR modes for iOS Quick Look and Android Scene Viewer/WebXR.
- Enforce runtime AR gating from model QA + scale metadata.
- Show 3D fallback experience when AR is unsupported or ineligible.

### 6. Admin Portal
- Build `/admin` UI for listing management.
- Build moderation queue view for uploaded model assets.
- Enforce publish gate: listing can only be published if model QA is approved.

### 7. Security, Rules, and Quality
- Add Firebase Auth integration and role-aware server checks.
- Add Firestore/Storage security rules.
- Add unit/integration/E2E tests for core flows.

## Detailed Execution Plan

### A. Environment Initialization
1. Create Firebase project `car-marketplace-ar`.
2. Enable and configure:
   - Firestore
   - Storage
   - Authentication (email/password + optional OAuth)
   - Cloud Functions
3. Create Netlify site `car-marketplace-ar-web` and connect repo.
4. Define environment variable templates for local/dev/prod.

### B. Codebase Scaffolding
1. Initialize source structure by domain (`types`, `lib`, `components`, `app/api`).
2. Add shared layout, navigation, and visual theme tokens.
3. Add lint/typecheck/test scripts and CI baseline.

### C. Domain + Validation Implementation
1. Implement strongly typed domain models and enums.
2. Add Zod validators for:
   - inquiry payloads
   - listing mutations
   - model moderation payloads
3. Add AR utility functions for:
   - dimension sanity checks
   - normalized-scale checks
   - AR eligibility calculation

### D. Data Access + Auth Layer
1. Implement Firebase client and admin initialization modules.
2. Implement data repository with Firestore-first behavior and local fallback for dev.
3. Implement admin guard that verifies Firebase token and user role.

### E. API Route Implementation
1. Build `GET /api/cars` with search/filter/sort query support.
2. Build `GET /api/cars/:id` with AR metadata in response.
3. Build `POST /api/inquiries` with schema validation and persistence.
4. Build admin routes:
   - listing create/update
   - listing publish toggle (with QA constraints)
   - model upload queue moderation actions

### F. Buyer UI Implementation
1. Home page listing grid with filters and sorting controls.
2. Dynamic detail page with full car specs and dimension display.
3. Inquiry form component with API integration and UX states.

### G. AR Viewer Implementation
1. Add `model-viewer` client component.
2. Configure attributes for AR and fallback camera controls.
3. Apply eligibility checks before rendering AR actions.
4. Present eligibility errors/disclaimers to user when blocked.

### H. Admin UI Implementation
1. Build admin auth gate surface.
2. Add listing create/update form.
3. Add model upload queue moderation controls.
4. Add publish/unpublish action with backend enforcement.

### I. Testing + Verification
1. Unit tests:
   - validation schemas
   - AR gating logic
2. Integration tests:
   - public/admin API contracts
   - publish gating behavior
3. E2E smoke tests:
   - browse -> detail -> inquiry
   - admin moderation and publish flow (mock/dev mode)

### J. Deployment and Operations
1. Configure Netlify build settings and deployment previews.
2. Apply Firebase rules and indexes.
3. Verify environment variables in Netlify and local setup.
4. Add operational runbook for moderation, incident handling, and release checks.
