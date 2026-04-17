# Operations Runbook

## 1. Listing Publication Checklist
1. Confirm listing metadata is complete (price, specs, photos).
2. Verify VIN/title checks completed externally and documented.
3. Confirm 3D model assets exist (GLB and USDZ).
4. Confirm model QA status is `approved` and dimensions are accurate.
5. Publish listing from admin portal.

## 2. Model Moderation Checklist
1. Validate source (`curated` or uploaded queue).
2. Confirm dimensions in meters and `normalizedScale = 1`.
3. Verify visual integrity and orientation in 3D viewer.
4. Approve/reject with notes.
5. If approved, ensure listing references the approved model ID.

## 3. Incident Response (AR or API)
1. Identify failing surface (`/cars/[id]` viewer, admin moderation API, inquiry API).
2. Check Netlify deploy logs and Firebase console logs.
3. Rollback recent deployment if regression is confirmed.
4. Temporarily unpublish affected listings if scale QA is uncertain.
5. Record incident summary and remediation steps.

## 4. Security Review Cadence
- Weekly review of admin role assignments.
- Weekly scan of Firestore and Storage rule changes.
- Monthly dependency update pass.
