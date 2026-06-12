# S14 — PowerSync local DB + schema

**Status:** Done

## What changed

- Added PowerSync client schema: `groups`, `members`, `expenses`, `expense_contributions`, `expense_allocations` (all `localOnly`)
- `openLocalDatabase()` — offline SQLite via `@powersync/adapter-sql-js` (Expo web / dev)
- `APP_SCHEMA_VERSION` for future layout bumps (PowerSync applies schema on open — no manual migrations)
- Vitest uses `@powersync/node` + `better-sqlite3` to assert tables exist and are empty

## Why

Real local SQLite before repository functions (`createGroup`, `addExpense` in S15–S16).

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] PowerSync schema defines all core offline tables
- [x] Vitest: tables exist, empty
- [x] `openLocalDatabase()` for app runtime (sql-js adapter)
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `open-database.test.ts` failed (schema / DB missing)
2. **GREEN** — schema, `openLocalDatabase`, Node SDK integration test

## Tests added

- `APP_TABLE_NAMES › lists every offline table in the client schema`
- `local database › creates empty tables for the splitpay schema`

## Manual checklist

- Not required this slice — DB is exercised in Vitest only until S15 wires repositories

## Files touched

- `apps/mobile/src/db/` — schema, open-database, table-names, index
- `apps/mobile/package.json`, `package-lock.json`
- `vitest.config.ts` — inline `@powersync/*` for Node tests
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/db/schema.ts`
2. `apps/mobile/src/db/open-database.ts`
3. `apps/mobile/src/db/open-database.test.ts`

## Next slice

**S15** — `createGroup` repository.
