# Specification

## Summary
**Goal:** Add optional per-day numeric habit amounts tied to a per-habit unit, and surface volume-aware analytics and exports while preserving the existing toggle-only workflow.

**Planned changes:**
- Extend backend data model to store a unit on each habit (minimum: reps, time/duration) and an optional numeric amount on each habit/day record alongside done/not-done.
- Update backend monthly tracker and export APIs to include habit unit and per-day optional amount, while remaining compatible with existing saved (toggle-only) data.
- Add migration so existing habits/records upgrade safely with a consistent default unit for legacy habits and no amounts on existing records.
- Update frontend habit create/edit to require/select a unit and display the unit anywhere amounts are shown/entered.
- Update the monthly habit grid so users can toggle done as before and optionally enter/update a numeric amount for done days, with consistent behavior when toggling back to not-done.
- Extend dashboard/progress visuals to keep frequency-based views and add at least one volume-over-time visualization that sums/trends amounts using the habit unit.
- Update CSV/PDF exports to include amount and unit data and remain usable when amounts are missing or data is legacy toggle-only.

**User-visible outcome:** Users can keep tracking habits with a simple done/not-done toggle, optionally log an amount (e.g., reps or time) on done days, see volume trends/totals in the dashboard, and export volume-aware CSV/PDF files without breaking existing data.
