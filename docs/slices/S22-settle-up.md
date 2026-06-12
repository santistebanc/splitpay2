# S22 — Settle screen

**Status:** Done

## What changed

- `SettleUpScreen` — shows `computeSettlements` suggestions; tap records a Payment expense
- Payment expense: payer contributes full amount, allocated to recipient only
- Playwright: `e2e/settle-up.spec.ts` — Bob pays Alice €6 → balances clear, Settlement row visible

## Why

Users can settle up from suggested transfers; balances move toward zero via a stored Payment.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Tap Settle → payment expense recorded
- [x] Balances move toward zero
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `settle-up.spec.ts` failed (Settle screen was a stub)
2. **GREEN** — `SettleUpScreen` with settlement buttons + `addExpense` payment

## Tests added

- `settle-up.spec.ts › recording a settlement moves balances toward zero`

## Manual checklist

- [ ] After Lunch expense (Alice paid €12): Settle Up shows "Bob pays Alice €6.00"
- [ ] Tap settlement → Group view balances at €0.00; "Settlement" in expenses
- [ ] Fully settled group shows "Everyone is settled up" on Settle screen

## Files touched

- `apps/mobile/src/screens/SettleUpScreen.tsx`
- `e2e/settle-up.spec.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/screens/SettleUpScreen.tsx`
2. `e2e/settle-up.spec.ts`

## Next slice

**S23** — Settings (rename, members, exit).
