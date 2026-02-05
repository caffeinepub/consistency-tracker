# Specification

## Summary
**Goal:** Fix Monthly Targets so defaults and saved overrides display correctly, remove targets for non-applicable habits, and tidy the Monthly Targets layout.

**Planned changes:**
- Update Monthly Targets auto-plan defaults so “Press-ups” and “Squats” use the Steady Climb plan and increase by +5 each month across the year, with robust name matching (e.g., “Press-ups”/“Push-ups”).
- Fix Monthly Targets to display persisted monthly target overrides (and prefill edit inputs from saved values when present), while preserving correct duration parsing/formatting for time-based habits like Plank.
- Disable monthly targets for “16/8 fasting”, “Run”, and “Squash” (no target display and no Edit controls for these habits).
- Clean up Monthly Targets UI layout for consistent alignment/spacing and stable row sizing in and out of edit mode, matching the structure shown in the uploaded screenshot.

**User-visible outcome:** Monthly Targets shows correct steady-climb defaults for Press-ups and Squats, correctly reflects and edits saved monthly overrides, hides target editing for fasting/run/squash, and looks cleaner and more consistent on mobile.
