# Specification

## Summary
**Goal:** Replace the current Monthly Targets behavior with calendar-mapped “Steady Climb” plan targets for Push-ups/Press-ups, Squats, and Plank, while still showing the user’s completed monthly totals.

**Planned changes:**
- Update the Monthly Targets panel to display “Steady Climb” plan targets (from IMG_3316-1.jpeg) for the currently selected calendar month.
- Treat Push-ups and Press-ups as the same plan habit and show the same monthly target for both.
- Show both values per habit row: the computed completed monthly **Total** (from records) and the plan **Target** (from the Steady Climb month mapping).
- Format Plank Target (and Total) as a duration (e.g., `1:15`) using the existing duration formatting utility, rather than raw seconds.
- Remove/replace any copy in the Monthly Targets panel that implies the displayed numbers are “totals based on completed daily entries” when they are plan targets.

**User-visible outcome:** When switching months in the dashboard month tabs, the Monthly Targets card shows the Steady Climb Target for that calendar month alongside the user’s completed Total for each applicable habit (with Plank displayed as a duration).
