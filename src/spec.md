# Specification

## Summary
**Goal:** Ensure “Steady Climb” habits show correct Monthly Targets by making each month’s target equal the sum of that habit’s completed daily amounts for the selected month/year, updating immediately and persisting across reloads.

**Planned changes:**
- Update habit tracking rules so that for applicable habits (e.g., press-ups, squats, plank), the monthly target for a habit+month+year is always recalculated as the sum of completed daily entries in that same month+year after every tick/untick and amount/duration edit.
- Treat missing daily amounts as 0 in the monthly sum (not 1), and exclude non-applicable habits (e.g., 16/8 fasting, run, squash) from this forced monthly-sum behavior.
- Persist the computed monthly summed value in the backend per habit+month+year, recalculating and storing it whenever completion records change, so values remain correct after reload and across devices/sessions.
- Frontend: make Monthly Targets always reflect the currently selected month/year in the Habits dashboard, and display the backend-computed sums with correct formatting (time habits shown as durations like 1:30).

**User-visible outcome:** As the user checks/unchecks days or edits amounts (including durations like plank) in the Daily Tracking grid, the Monthly Targets for the currently selected month/year update immediately to the correct totals and remain correct after refresh or on another device.
