# S6 — computeBalances (one expense, equal allocations)

**Status:** Done

## What changed

- Added `computeBalances(members, expenses)` in `packages/ledger/src/compute-balances.ts`
- Credits each contribution; debits each allocation an equal share of `amountCents`
- Returns balances sorted ascending (biggest debtors first)
- Empty allocations expand to all members in the passed snapshot (fallback)

## Why

First real ledger behavior — the core credit/debit loop from spec §6.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] One expense, two equal allocations, divides evenly
- [x] Contributor credited full amount; each allocation debited equal share
- [x] Balances sum to zero
- [x] Sorted ascending by balance

## RED → GREEN

1. **RED** — `compute-balances.test.ts` failed (module missing)
2. **GREEN** — `computeBalances` implemented

## Test added

- `computeBalances › credits the contributor and debits each allocation equally for one expense`

## Files touched

- `packages/ledger/src/compute-balances.ts`
- `packages/ledger/src/compute-balances.test.ts`
- `packages/ledger/src/index.ts`
- `docs/SLICES.md`, this file

## Read first

1. `packages/ledger/src/compute-balances.test.ts` — the scenario
2. `packages/ledger/src/compute-balances.ts` — credit/debit loop

## Next slice

**S7** — Rounding: 100¢ ÷ 3 people → zero-sum deterministic cents.
