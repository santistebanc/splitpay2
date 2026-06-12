# S21 — Add Expense screen

**Status:** Done

## What changed

- `AddExpenseScreen` — amount, note, paid-by picker; saves via `addExpense` with all-member allocations
- `parseAmountToCents()` — decimal string → integer cents
- Returns to Group view with `goBack()` so balances refresh on focus
- Playwright: `e2e/add-expense.spec.ts` — create group, add Lunch €12, Alice paid → balances update

## Why

Completes the minimal UI loop: record a cost and see balances move on Group view.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Add Expense form saves to SQLite
- [x] Playwright: add expense → balances update
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — duplicate Group screens after save (strict mode violation in Playwright)
2. **GREEN** — `goBack()` after save; full add-expense flow

## Tests added

- `parseAmountToCents › parses decimal and whole amounts`
- `parseAmountToCents › returns null for invalid input`
- `add-expense.spec.ts › adding an expense updates balances on the group view`

## Manual checklist

- [ ] From Group view → Add Expense → enter 12.00, Lunch, Alice paid → Save
- [ ] Group view shows Lunch in expenses; Alice `+€6.00`, Bob `-€6.00`
- [ ] Invalid amount shows error

## Files touched

- `apps/mobile/src/screens/AddExpenseScreen.tsx`
- `apps/mobile/src/lib/parse-amount.ts`, `parse-amount.test.ts`
- `e2e/add-expense.spec.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/screens/AddExpenseScreen.tsx`
2. `e2e/add-expense.spec.ts`

## Next slice

**S22** — Settle screen.
