# Specification

## Summary
**Goal:** Let users adjust habit targets per calendar month/year with auto-filled defaults for specific habits, and show both month-scoped progress and lifetime totals.

**Planned changes:**
- Backend: Add storage and APIs for per-habit monthly target overrides keyed by (caller, habitId, month, year), including fetch and upsert/clear, with ownership checks.
- Backend: When no manual override exists, compute default monthly targets from the “Steady Climb” plan for habits named Push-ups, Squats, and Plank (Jan=1 … Dec=12), with Plank stored as seconds.
- Backend: Add an API to return lifetime (all-time) totals per habit (completion count and total volume), including unit info for formatting.
- Frontend: Add a simple monthly targets editor UI with month/year selection that shows per-habit targets (override > auto default > blank) and allows set/update/clear with toast feedback.
- Frontend: Update progress UI to clearly show “This month” progress alongside “All time” lifetime totals, formatting time volumes as durations and reps as numbers.
- Frontend: Add React Query hooks for monthly targets and lifetime totals APIs, including appropriate cache invalidation to keep editor and dashboards in sync.

**User-visible outcome:** Users can pick any month/year to edit targets for each habit (with automatic “Steady Climb” defaults for Push-ups/Squats/Plank), and they can view both monthly progress and all-time totals for each habit in the app.
