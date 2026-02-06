# Specification

## Summary
**Goal:** Revert the application to the Version 18 consistency tracker (Habits UI) and unblock deploy/publish while ensuring safe compatibility with existing canister stable state and preventing blank-screen startup failures.

**Planned changes:**
- Fully revert frontend and backend behavior to the Version 18 Habits tracker UX and logic, removing/rolling back Version 19–23 behavior that could cause deploy/publish to fall back to a newer version.
- Add/maintain Motoko upgrade migration logic so the Version 18 backend can read newer stable-state shapes and convert them into Version 18-compatible stable state without losing Version 18 entity data (profiles, habits, records, monthly targets).
- Make the startup/render path regression-safe: ensure initial UI render is null-safe, uses loading states appropriately, and routes fatal boot/render errors through the existing error boundary fallback UI instead of a blank white screen.

**User-visible outcome:** A fresh draft build consistently opens to the Version 18 habits consistency tracker experience, loads reliably from login through dashboard without blank screens, and can be deployed and published without reverting to a newer version during publish; existing user data remains available after upgrade.
