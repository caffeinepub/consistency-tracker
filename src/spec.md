# Specification

## Summary
**Goal:** Add an Investments module with an Investment Diary and multi-goal Investment Goals tracking (with a fixed deadline of Dec 31, 2026), including per-user persistence and progress computed from manually selected diary entries.

**Planned changes:**
- Backend: Add per-user CRUD storage and access control for Investment Diary entries (date, asset name, amount invested, notes).
- Backend: Add per-user CRUD storage and access control for Investment Goals (asset name, portfolio target, fixed deadline Dec 31, 2026, and persisted list of selected diary entry IDs).
- Frontend: Add React Query hooks and mutations for diary entries and goals (including updating a goal’s selected entry IDs), integrated with existing auth/actor flow and query invalidation.
- Frontend: Add navigation labeled exactly “Investment goals” to switch between the existing tracker dashboard and the new Investments view.
- Frontend: Build Investments UI including (1) diary entry form + entries list, (2) goal create/edit and multi-goal display, (3) per-goal manual selection of diary entries, and (4) per-goal progress bar + numeric progress summary and read-only deadline display (“Dec 31, 2026”).

**User-visible outcome:** Users can open a new “Investment goals” area to log investment diary entries, create and manage multiple investment goals due Dec 31, 2026, manually choose which entries count toward each goal, and see progress bars and totals that update as entries/goals change.
