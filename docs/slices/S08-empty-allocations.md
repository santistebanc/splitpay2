# S8 — Empty allocations fallback

**Status:** Done

## What changed

- Tests lock in empty `allocations` behavior in `computeBalances`
- Empty list expands to all members in the **passed snapshot** (the `members` argument)
- Caller must not pass the live group roster for old expenses — matches Allocation snapshot in CONTEXT.md

## Why

Spec §6 fallback for empty allocations; paired with snapshot-on-save so new joiners are not retroactively charged.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Empty allocations split across snapshot members
- [x] Only snapshot members appear in balances (no Carol-from-future case)
- [x] Balances still sum to zero

## RED → GREEN

1. **RED** — tests added for untested fallback behavior
2. **GREEN** — existing `computeBalances` logic already handled it; tests pass

## Tests added

- `computeBalances › empty allocations debit all members in the passed snapshot`
- `computeBalances › empty allocations use the snapshot only, not a wider group roster`

## Files touched

- `packages/ledger/src/compute-balances.test.ts`
- `docs/SLICES.md`, this file

## Read first

1. `packages/ledger/src/compute-balances.test.ts` — empty allocation cases
2. `allocationIds` branch in `compute-balances.ts`

## Next slice

**S9** — `computeSettlements` greedy matching.
