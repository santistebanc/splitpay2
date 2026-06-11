# S9 — computeSettlements

**Status:** Done

## What changed

- Added `computeSettlements(balances)` with greedy largest-debtor → largest-creditor matching
- Returns suggested transfers `{ fromMemberId, toMemberId, amountCents }`
- Empty result when all balances are zero

## Why

Spec §6 settlement suggestions for the Settle screen — derived on demand, not stored.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Mixed debts produce expected transfer list
- [x] Zero balances → no settlements
- [x] Exported from ledger package

## RED → GREEN

1. **RED** — `compute-settlements.test.ts` failed (module missing)
2. **GREEN** — greedy matcher implemented

## Tests added

- `computeSettlements › matches largest debtor to largest creditor for mixed balances`
- `computeSettlements › returns no settlements when everyone is at zero`

## Files touched

- `packages/ledger/src/compute-settlements.ts`
- `packages/ledger/src/compute-settlements.test.ts`
- `packages/ledger/src/index.ts`
- `docs/SLICES.md`, this file

## Read first

1. `packages/ledger/src/compute-settlements.test.ts`
2. `packages/ledger/src/compute-settlements.ts`

## Next slice

**S10** — `isPayment` detection.
