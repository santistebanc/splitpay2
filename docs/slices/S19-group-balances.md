# S19 — Group View balances panel

**Status:** Done (awaiting confirm)

## What changed

- `listGroupExpenses(db, groupId)` — loads expenses with contributions and allocations
- `formatBalanceCents()` — signed currency display (e.g. `+€6.00`)
- `GroupScreen` — balances panel via `computeBalances` from `@splitpay/ledger`
- `?e2eSeed=group-balances` — group with dinner expense (Alice pays 1200¢, split 2 ways)
- Playwright: `e2e/group-balances.spec.ts` — Bob `-€6.00`, Alice `+€6.00`

## Why

Group View shows net positions from persisted expenses using the same ledger math as the package tests.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Balances panel on Group screen
- [x] Playwright: balances match ledger
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `group-balances.spec.ts` failed (balances panel missing)
2. **GREEN** — `listGroupExpenses`, `GroupScreen` balances, e2e seed

## Tests added

- `listGroupExpenses › returns expenses with contributions and allocations for a group`
- `formatBalanceCents › formats positive and negative euro balances`
- `group-balances.spec.ts › shows balances that match the ledger for a seeded group`

## Manual checklist

- [ ] Open `/?e2eSeed=group-balances` → tap Ski weekend
- [ ] Bob shows `-€6.00`, Alice shows `+€6.00` (Bob listed first — most in debt)
- [ ] Empty group shows "No expenses yet"

## Files touched

- `apps/mobile/src/db/list-group-expenses.ts`, `list-group-expenses.test.ts`
- `apps/mobile/src/lib/format-balance.ts`, `format-balance.test.ts`
- `apps/mobile/src/screens/GroupScreen.tsx`, `apps/mobile/src/db/e2e-seed.ts`
- `e2e/group-balances.spec.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/screens/GroupScreen.tsx`
2. `apps/mobile/src/db/list-group-expenses.ts`
3. `e2e/group-balances.spec.ts`

## Next slice

**S20** — Group View expenses list.
