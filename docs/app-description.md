# Car Marketplace AR App (V1 Product Description)

## 1. Product Vision
Car Marketplace AR is a web-first marketplace where buyers can evaluate a car listing in a realistic way before contacting the seller. Beyond standard photos/specs, each listing can launch a true-to-scale AR experience so buyers can place the car in their driveway, garage, or parking context to estimate fit and visual presence before making a decision.

The product is designed for high-confidence purchase intent generation, not direct checkout. V1 uses lead generation: buyers browse, evaluate, and submit inquiries.

## 2. Core Value Proposition
- Reduce uncertainty before contact with true-to-scale car visualization.
- Increase buyer confidence via complete listing details and asset quality checks.
- Give admins strong moderation controls to keep inventory and 3D assets trustworthy.
- Support iOS and Android AR launch paths with robust non-AR fallback.

## 3. User Personas

### Buyer
- Browses available cars with filters (price, make, year, condition).
- Opens a detail page with specs, price, photos, and AR section.
- Launches AR or interactive 3D preview.
- Submits inquiry to seller/operations team.

### Admin
- Curates listing inventory and publish status.
- Manages model assets (GLB/USDZ) and validates dimension/scale quality.
- Approves or rejects upload queue entries.
- Enforces that only QA-approved models can be published with active listings.

### Optional Model Uploader (Pending Moderation)
- Uploads candidate model assets and dimension metadata.
- Cannot auto-publish.
- Assets enter a pending queue for admin QA and approval.

## 4. Primary User Flows

### Flow A: Browse and Discover
1. Buyer lands on marketplace home page.
2. Buyer filters/sorts listings.
3. Buyer opens car detail page.

### Flow B: Evaluate with True-Scale AR
1. Buyer opens the AR section on detail page.
2. System verifies AR eligibility from model metadata:
   - QA status is approved.
   - GLB/USDZ assets exist.
   - Dimensions are valid meters.
   - Normalized scale is exactly 1 scene unit = 1 meter.
3. Buyer launches AR:
   - iOS: Quick Look using USDZ.
   - Android: Scene Viewer/WebXR from GLB.
   - Other/unsupported: interactive 3D viewer fallback.

### Flow C: Submit Inquiry
1. Buyer fills an inquiry form on detail page.
2. Server validates request and stores inquiry.
3. Buyer receives confirmation and reference timestamp.

### Flow D: Admin Moderation and Publishing
1. Admin signs in and opens admin portal.
2. Admin creates/edits listing metadata.
3. Admin reviews model upload queue and QA status.
4. Admin approves model if true-scale checks pass.
5. Admin publishes listing only when model QA is approved.

## 5. True-to-Scale AR Specification

### Canonical Dimension Model
Each model stores canonical dimensions in meters:
- `length`
- `width`
- `height`

### Normalization Rule
- 3D source must be authored/normalized so **1 scene unit = 1 meter**.
- Stored as `normalizedScale = 1` once verified.

### Ingestion-Time Validation
At model intake (curated or uploaded), the system records:
- Asset presence (`glbPath`, `usdzPath`)
- Dimensions in meters
- Source type (`curated` or `uploaded`)
- QA status (`pending`, `approved`, `rejected`)
- Optional checksum/version

### Runtime Validation Before AR Enablement
AR controls are shown only when:
- Model QA status is `approved`.
- Dimensions are finite, positive values.
- Normalized scale is exactly `1`.
- GLB (and ideally USDZ for iOS Quick Look) exists.

If these checks fail, detail page shows a clear message and only non-AR fallback.

## 6. Trust, Safety, and Legal Notes
- AR scale is an aid and may vary slightly by device sensor precision and floor detection.
- UI includes a disclaimer that physical fit remains buyer responsibility.
- Listing operations include VIN/title verification checklist (operational process).
- Photo and model authenticity checks are required before publishing.
- Uploaded models are never auto-published.

## 7. Non-Functional Goals

### Performance
- Listing pages render quickly with SSR/ISR patterns for SEO and speed.
- Car detail pages target fast contentful paint on mobile networks.
- 3D assets should use compressed GLB where possible and lazy loading.

### Accessibility
- Keyboard navigation for core journeys.
- Sufficient text contrast and semantic form labels.
- AR actions have descriptive labels and fallback options.

### SEO
- Indexable listing pages and detail metadata.
- Canonical titles/descriptions per car.

### Security
- Firebase Auth-backed authorization.
- Firestore and Storage rules enforcing role boundaries.
- Server-side schema validation for all mutation endpoints.

## 8. Data and Platform Architecture (V1)

### Frontend
- Next.js (TypeScript, App Router).
- Tailwind CSS for UI styling.
- `@google/model-viewer` for AR/3D launch and fallback preview.

### Backend/Data
- Firebase Firestore collections for listings/models/inquiries/users/uploads.
- Firebase Storage for 3D assets and listing media.
- Firebase Auth for buyer/admin identity.
- Cloud Functions reserved for async automation and future workflows.

### Hosting
- Netlify for Next.js frontend deployment.
- Firebase for backend services and storage.

## 9. Firebase and Netlify Project Requirements

### Firebase Project Requirement
A dedicated Firebase project must be created for this app (`car-marketplace-ar`):
- Enable Firestore, Storage, Authentication, and Functions.
- Configure production and preview environments with separate config if needed.
- Apply Firestore/Storage security rules before public release.

### Netlify Project Requirement
A dedicated Netlify site must be created (`car-marketplace-ar-web`):
- Connect to the Git repository and configure build command/output.
- Set all required environment variables (Firebase public config + server credentials).
- Enable deploy previews and production deployment pipeline.

## 10. V1 Scope Boundaries
Included:
- Browse/search listings.
- Car detail pages with AR section.
- Inquiry submission.
- Admin listing/model moderation and publish workflow.
- Hybrid model source strategy (curated default + upload queue).

Not included in V1:
- In-app checkout/payment.
- Unrestricted open listing by all users.
- Automated pricing engines or financing workflows.
