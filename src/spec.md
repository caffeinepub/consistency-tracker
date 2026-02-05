# Specification

## Summary
**Goal:** Ensure Daily Tracking completion/values are saved, fetched, and displayed strictly per selected month/year, with no bleed-over between months (e.g., February vs March).

**Planned changes:**
- Update backend persistence and queries so Daily Tracking records are stored and retrieved scoped to the selected month and year.
- Adjust the Daily Tracking frontend to fetch and render records for the currently selected month/year only.
- Prevent stale rendering on month switches by clearing the grid (unchecked/empty) and/or showing a loading state until the selected month/year data finishes loading.
- Make client-side record lookup/mapping keys month-safe by including habitId + day + month + year to avoid collisions across months/years.

**User-visible outcome:** Switching months in Daily Tracking shows only that month’s saved completions/values, with no temporary or permanent display of a different month’s data, and month-specific data remains correct after reload.
