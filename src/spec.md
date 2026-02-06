# Specification

## Summary
**Goal:** Prevent the Daily Tracking (HabitGrid) horizontal scroll position from resetting to day 1 when toggling habit completion or saving unit amounts.

**Planned changes:**
- Preserve the HabitGrid horizontal scroll position across completion toggles (complete/incomplete) so the view stays on the same day the user was viewing.
- Preserve the same scroll position behavior when saving an amount via the unit-based habit popover.
- Adjust HabitGrid loading behavior so background refetches triggered by toggles do not replace/unmount the grid with a loading card/skeleton, while keeping the initial page-load loading UI and ensuring month switching remains correct.

**User-visible outcome:** When viewing a later day in the Daily Tracking grid (e.g., day 15), checking/unchecking a habit or saving an amount no longer jumps the grid back to day 1; the grid stays in place while updates/refetches occur.
