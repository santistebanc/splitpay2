# Sync upload hardening (post-S28)

**Status:** Done (commits `6fde6b1`, `34285a6`)

Not a numbered roadmap slice — hardening on top of S27/S28 after manual two-tab testing.

## What changed

- **`supabase-connector.ts`** — duplicate group inserts no longer abort the batch; ensure `group_memberships` before member uploads
- **`connect-sync.ts`** — `flushPendingUploads`, `reconnectSyncIfConfigured`, auth before connect
- **`supabase-client.ts`** — shared Supabase client + `ensureSupabaseSession`
- **`use-on-tables-change.ts`** — screens reload when synced SQLite data changes
- **Screens** — flush uploads after create group / add expense / settings edits; live UI refresh on Group, Groups, Settings, Settle Up
- **`app-database.web.ts`** — PowerSync SharedWorker path for Expo web
- **`powersync-sync.test.ts`** — regression suite (`PowerSync regression` describe block)
- **`npm run web`** — local Supabase + PowerSync env vars for dev

## Why

Creating a group uploaded the `groups` row but could drop `members` and `group_memberships` on retry; the UI only refreshed on navigation, so a second tab never showed synced data.

## Verify

```bash
npm run supabase:reset && npm run powersync:start
npm run test:sync
```

See also [`MANUAL-SYNC-TESTING.md`](../MANUAL-SYNC-TESTING.md).

## Tests added

- `PowerSync regression › uploads members and host membership on fresh group create`
- `PowerSync regression › uploads members when the group row already exists on the server`
- `PowerSync regression › syncs roster and expenses to a second connected client without reconnect`

## Read first

1. `apps/mobile/src/db/supabase-connector.ts`
2. `powersync-sync.test.ts`
3. `docs/MANUAL-SYNC-TESTING.md`
