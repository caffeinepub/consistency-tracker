# Specification

## Summary
**Goal:** Roll back the deployed application from Version 36 to the last known working Version 35 (frontend and backend) and confirm startup/login completes successfully.

**Planned changes:**
- Restore and redeploy the full app (frontend assets and backend canister/actor code) to the exact Version 35 code and configuration, replacing Version 36.
- Verify end-to-end initialization for an authenticated user: Internet Identity login completes, backend actor is available, healthCheck succeeds, and the app proceeds to Profile Setup (new users) or Dashboard (existing users) without hitting loading timeout.

**User-visible outcome:** Users are served Version 35 and can log in with Internet Identity and reach the normal app UI without getting stuck on initialization or seeing a “Loading Timeout” during typical startup.
