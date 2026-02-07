# Specification

## Summary
**Goal:** Force Internet Identity login before any Consistency Tracker UI is shown, and make backend initialization/data loading retry silently without showing a connection error banner.

**Planned changes:**
- Gate all app UI (dashboard/header/pages) behind Internet Identity authentication so signed-out users see only the login screen.
- After successful login, initialize an authenticated (non-anonymous) backend actor and enable authenticated React Query loading for the signed-in principal.
- Load any previously stored user data (profile, habits, records, diary, investments) automatically after login.
- Remove the “Connection Issue” banner and the “Retry Connection” button from the UI.
- Adjust query/initialization retry behavior to automatically retry with a non-aggressive delay strategy in the background, without requiring user interaction.

**User-visible outcome:** On launch, users must sign in with Internet Identity before seeing any tracker UI; after sign-in their existing data loads automatically, and transient backend issues recover silently without any connection warning banner or retry button.
