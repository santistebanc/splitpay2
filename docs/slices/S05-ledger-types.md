# S5 — Ledger types

**Status:** Done

## What changed

- Added `LedgerMember`, `ExpenseContribution`, `ExpenseAllocation`, and `LedgerExpense`
- Expenses use `contributions` (paid-by) and `allocations` (paid-for) — ready for multi-payer later
- Updated `CONTEXT.md` with Contribution, Allocation, Allocation snapshot; narrowed Split to UI language
- Tests document snapshot rule: new members are not retroactively allocated

## Why

Pure money math needs plain data types before algorithms land. Contribution/Allocation names separate paid-by from paid-for and avoid overloading "split."

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] `LedgerMember`, `LedgerExpense`, `ExpenseContribution`, `ExpenseAllocation` defined
- [x] Single contribution equals full amount (today's spec)
- [x] Empty `allocations` valid as ledger fallback only
- [x] Glossary updated and guarded by `context.test.ts`
- [x] Types re-exported from ledger package entry

## RED → GREEN

1. **RED** — `types.test.ts` failed typecheck (`./types` missing)
2. **GREEN** — `types.ts` added; refined after review (Contribution/Allocation)

## Tests added

- `ledger types › represents members and an expense for balance calculation`
- `ledger types › allows empty allocations as a ledger fallback for snapshot expansion`
- `ledger types › keeps saved allocations when a new member joins the group later`

## Files touched

- `packages/ledger/src/types.ts`
- `packages/ledger/src/types.test.ts`
- `packages/ledger/src/index.ts`
- `CONTEXT.md`, `context.test.ts`
- `docs/SLICES.md`, this file

## Read first

1. `packages/ledger/src/types.ts` — contributions vs allocations
2. `CONTEXT.md` — Contribution, Allocation, Allocation snapshot
3. `packages/ledger/src/types.test.ts` — Carol-not-charged scenario

## Next slice

**S6** — `computeBalances` for one expense with equal allocations.
