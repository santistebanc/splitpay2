# S10 — isPayment

**Status:** Done

## What changed

- Added `isPayment(expense)` to detect settle-up **Payment** expenses
- True when: exactly one contribution, exactly one allocation, different members

## Why

Spec §6 — drives list UI (“X paid Y” vs “by X”) and payment activity types.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Alice → Bob single allocation = payment
- [x] Multi-member allocation = not payment
- [x] Same contributor and allocation = not payment

## RED → GREEN

1. **RED** — `is-payment.test.ts` failed (module missing)
2. **GREEN** — `isPayment` implemented

## Tests added

- `isPayment › returns true when one contributor pays and one other member is allocated`
- `isPayment › returns false for a normal expense split across multiple members`
- `isPayment › returns false when contributor and allocation are the same member`

## Files touched

- `packages/ledger/src/is-payment.ts`
- `packages/ledger/src/is-payment.test.ts`
- `packages/ledger/src/index.ts`
- `docs/SLICES.md`, this file

## Read first

1. `packages/ledger/src/is-payment.test.ts`
2. `packages/ledger/src/is-payment.ts`

## Next slice

**S11** — Expo web shell + Paper M3 theme (app slice begins).
