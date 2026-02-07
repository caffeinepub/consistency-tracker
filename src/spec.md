# Specification

## Summary
**Goal:** Fix the MonthTabs month selector so users can horizontally scroll to reach all months (Jan–Dec) on desktop and mobile.

**Planned changes:**
- Update `frontend/src/components/MonthTabs.tsx` to render a single-line, horizontally scrollable month tab strip with overflow handling that is not blocked by parent elements.
- Ensure scrolling allows partial tab visibility at the edges (no forced snapping; no wrapping into multiple rows).
- Preserve default selected month as the current month on initial load and auto-scroll the strip so the selected month is brought into view if off-screen.
- Add/extend frontend tests to assert all 12 month tabs render and that MonthTabs is configured for horizontal overflow (regression coverage for months before May being reachable).

**User-visible outcome:** Users can swipe/scroll the month tabs left/right to access every month from January through December, and the current/selected month is automatically visible on load.
