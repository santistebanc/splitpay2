# S16 — addExpense repository

**Status:** Done (awaiting confirm)

## What changed

- `addExpense(db, input)` — inserts expense, contribution, and allocation rows in one transaction
- `getExpense(db, expenseId)` — loads expense with allocation snapshot, or `null` when missing
- Vitest: dinner scenario (Alice pays 1200¢, allocated to Alice + Bob) insert + read-back
- `vitest.config.ts` — `fileParallelism: false` so PowerSync DB tests do not race

## Why

Persist expenses with explicit allocation snapshots (ADR 0002) before the UI loop reads balances from SQLite.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] `addExpense` persists expense + contributions + allocations
- [x] Vitest: insert + read back
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `add-expense.test.ts` failed (repository missing)
2. **GREEN** — `add-expense.ts`, exports from `db/index.ts`

## Tests added

- `addExpense › persists an expense with contributions and allocation snapshot`
- `addExpense › returns null when the expense id is unknown`

## Manual checklist

- Not required — repository only; UI wiring starts at S17

## Files touched

- `apps/mobile/src/db/add-expense.ts`, `add-expense.test.ts`
- `apps/mobile/src/db/index.ts`
- `vitest.config.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/db/add-expense.ts`
2. `apps/mobile/src/db/add-expense.test.ts`
3. `apps/mobile/src/db/schema.ts`

## Next slice

**S17** — Groups home list from SQLite.
