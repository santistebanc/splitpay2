# S20 — Group View expenses list

**Status:** Done (awaiting confirm)

## What changed

- `GroupScreen` — expenses list below balances (note + amount)
- `formatAmountCents()` — unsigned currency display (e.g. `€12.00`)
- Playwright: `e2e/group-expenses.spec.ts` — "Dinner" / `€12.00` visible on group view

## Why

Group View shows recorded costs alongside balances before the Add Expense screen (S21).

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Expenses list on Group screen
- [x] Playwright: expense row visible
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `group-expenses.spec.ts` failed (expenses list missing)
2. **GREEN** — expenses section on `GroupScreen`, `formatAmountCents`

## Tests added

- `formatAmountCents › formats euro amounts without a sign`
- `group-expenses.spec.ts › shows expense rows on the group view`

## Manual checklist

- [ ] Open `/?e2eSeed=group-balances` → tap Ski weekend
- [ ] Expenses section shows "Dinner" and `€12.00`
- [ ] New group with no expenses shows "No expenses yet" in Expenses section

## Files touched

- `apps/mobile/src/screens/GroupScreen.tsx`
- `apps/mobile/src/lib/format-balance.ts`, `format-balance.test.ts`
- `e2e/group-expenses.spec.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/screens/GroupScreen.tsx`
2. `e2e/group-expenses.spec.ts`

## Next slice

**S21** — Add Expense screen.
