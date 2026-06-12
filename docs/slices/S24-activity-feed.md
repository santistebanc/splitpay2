# S24 — Activity feed

**Status:** Done (awaiting confirm)

## What changed

- `activities` table (schema v3) — append-only group event log
- `addExpense` records activity with human-readable summary (expense vs payment)
- `formatExpenseActivitySummary` — "Alice paid €12.00 for Lunch" / "Bob paid Alice €6.00"
- `listGroupActivities` — newest first
- `GroupScreen` — Activity panel below expenses
- Playwright: `e2e/activity-feed.spec.ts`

## Why

Users see a chronological feed of what happened in the group, not just raw expense rows.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Actions appear in feed
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `activity-feed.spec.ts` failed (no activity feed on Group view)
2. **GREEN** — activities table + recording on `addExpense` + feed UI

## Tests added

- `formatExpenseActivitySummary › summarizes a normal expense with a note`
- `formatExpenseActivitySummary › summarizes a settle-up payment`
- `listGroupActivities › returns activity rows for expenses newest first`
- `addExpense › persists an expense with contributions and allocation snapshot` (activity assertion)
- `activity-feed.spec.ts › adding an expense appends to the activity feed`

## Manual checklist

- [ ] Add Lunch €12 (Alice paid) → Activity shows "Alice paid €12.00 for Lunch"
- [ ] Settle up → Activity shows "Bob paid Alice €6.00"
- [ ] Multiple expenses → newest activity first

## Files touched

- `apps/mobile/src/db/schema.ts`, `table-names.ts`, `add-expense.ts`
- `apps/mobile/src/db/list-group-activities.ts`, `list-group-activities.test.ts`
- `apps/mobile/src/lib/format-expense-activity.ts`, `format-expense-activity.test.ts`
- `apps/mobile/src/screens/GroupScreen.tsx`
- `e2e/activity-feed.spec.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/db/add-expense.ts`
2. `apps/mobile/src/lib/format-expense-activity.ts`
3. `e2e/activity-feed.spec.ts`

## Next slice

**S25** — Supabase migrations.
