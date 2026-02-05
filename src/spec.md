# Specification

## Summary
**Goal:** Stop the authenticated app flow from crashing on initial load when `userProfile` has not yet resolved, and ensure the header never throws if profile name data is missing.

**Planned changes:**
- Gate rendering of the authenticated area so `TrackerDashboard` is not rendered until `useGetCallerUserProfile()` has deterministically resolved to either a real `UserProfile` object or an explicit `null` (never `undefined`).
- Preserve the existing flow routing: unauthenticated shows `LoginScreen`; authenticated without profile shows `ProfileSetup`; authenticated with profile shows `TrackerDashboard`.
- Add defensive rendering in the header/user badge so missing/empty `userProfile.name` cannot crash the UI (use safe fallbacks for welcome text/initials), keeping logout available even with malformed profile data.

**User-visible outcome:** On authenticated sessions, the app reliably loads into Profile Setup (if no profile) or the dashboard (if profile exists) without the “undefined is not an object (evaluating 'userProfile.name')” error, and the header remains stable even if profile name fields are missing.
