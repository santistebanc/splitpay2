# S30 — Native SQLite + useQuery live UI

**Status:** Done

## What changed

- **`app-database.ts`** — Expo Go → SQL.js; dev/production build → `ReactNativeQuickSqliteOpenFactory`
- **`is-expo-go.ts`** — detects Expo Go sandbox via `expo-constants`
- **`DatabaseProvider`** — wraps app in `PowerSyncContext` for `@powersync/react` hooks
- **`hooks/use-group-queries.ts`**, **`use-group-with-members.ts`**, **`use-sync-on-focus.ts`** — watched SQL + focus-time roster refresh
- **`group-query-rows.ts`** — shared row mappers + `assembleExpenseRecords`
- **Screens** — Group, Groups, SettleUp, Settings, AddExpense use `useQuery` instead of manual `loadGroup` + `useOnTablesChange`
- **Removed** — `use-on-tables-change.ts` (replaced by PowerSync watched queries)
- **Upload hardening** — serialized uploads, duplicate-key / 409 tolerance (`supabase-connector.ts`, `upload-errors.ts`)
- **Sync lifecycle** — reconnect on download error, app foreground, `ensureSyncConnected` checks download errors
- **`app.json`** — quick-sqlite plugin, Android cleartext for local dev
- **`npm run mobile:android`** — dev build entry point
- **`docs/MOBILE-DEV.md`** — Expo Go vs dev build guidance

## Why

Expo Go + SQL.js could upload but not reliably download (laptop → phone). Manual reload hooks were brittle. Native SQLite + PowerSync `useQuery` is the supported path for bidirectional sync and live UI.

## Verify

```bash
npm run verify
```

Manual: dev build on phone + `npm run web:sync` on laptop — create expense on laptop, appears on phone without leaving the group screen.

## Exit criteria

- [x] Native adapter selected outside Expo Go
- [x] Screens use `useQuery` for SQLite reads
- [x] Upload mutex + duplicate handling
- [x] `npm run verify` green

## Read first

1. `apps/mobile/src/db/app-database.ts`
2. `apps/mobile/src/db/hooks/use-group-queries.ts`
3. `apps/mobile/src/screens/GroupScreen.tsx`
