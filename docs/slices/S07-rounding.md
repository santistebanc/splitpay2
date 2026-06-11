# S7 — Equal split rounding

**Status:** Done

## What changed

- `computeBalances` now splits debits in whole cents using the largest-remainder method
- Extra cents go to later slots in the saved allocation order (deterministic, zero-sum)
- Test: 100¢ ÷ 3 → 33 + 33 + 34

## Why

Spec §6 requires integer cents with deterministic rounding so balances always sum to zero.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] 100 cents / 3 people → balances sum to zero
- [x] Debits are 33, 33, 34 (allocation order)
- [x] S6 test still passes (even division)

## RED → GREEN

1. **RED** — 100/3 test failed (floating-point debits)
2. **GREEN** — `debitShares` uses integer floor progression

## Test added

- `computeBalances › 100 cents split 3 ways sums to zero with deterministic rounding`

## Files touched

- `packages/ledger/src/compute-balances.ts`
- `packages/ledger/src/compute-balances.test.ts`
- `docs/SLICES.md`, this file

## Read first

1. `packages/ledger/src/compute-balances.test.ts` — §19 rounding case
2. `debitShares` in `compute-balances.ts`

## Next slice

**S8** — Empty allocations expand to all members in the snapshot.
