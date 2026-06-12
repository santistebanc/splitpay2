# S15 — createGroup repository

**Status:** Done (awaiting confirm)

## What changed

- `generateJoinCode()` / `isValidJoinCode()` — five-character codes from an unambiguous alphabet
- `createGroup(db, input)` — inserts a group row and initial members in one transaction
- `getGroup(db, groupId)` — loads group + members, or `null` when missing
- Vitest uses real PowerSync SQLite (`@powersync/node`) for insert + read-back

## Why

Persist groups locally before the minimal UI loop (S17+) and `addExpense` (S16).

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] `createGroup` inserts group + members
- [x] Vitest: insert + read back
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `create-group.test.ts` failed (repository missing)
2. **GREEN** — `create-group.ts`, `join-code.ts`, exports from `db/index.ts`

## Tests added

- `join code › generates a five-character code from the safe alphabet`
- `join code › rejects ambiguous or wrong-length codes`
- `createGroup › persists a group with initial members and reads it back`
- `createGroup › returns null when the group id is unknown`

## Manual checklist

- Not required — repository only; UI wiring starts at S17

## Files touched

- `apps/mobile/src/db/create-group.ts`, `create-group.test.ts`
- `apps/mobile/src/db/join-code.ts`, `join-code.test.ts`
- `apps/mobile/src/db/index.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/db/create-group.ts`
2. `apps/mobile/src/db/create-group.test.ts`
3. `apps/mobile/src/db/join-code.ts`

## Next slice

**S16** — `addExpense` repository.
