# S27 — PowerSync connect (env-gated)

**Status:** Done (awaiting confirm)

## What changed

- Removed `localOnly` from client schema; added `group_id` on expense line tables for sync rules
- `supabase/migrations/20260613060000_powersync.sql` — `group_memberships`, publication, RLS
- `powersync/config.yaml` + `powersync/sync-rules.yaml` — local PowerSync service
- `scripts/start-powersync.sh` + `npm run powersync:start`
- `SupabaseConnector`, `sync-config.ts`, `connectSyncIfConfigured` — env-gated connect in `DatabaseProvider`
- `powersync-sync.test.ts` — two clients sync one expense (skips when PowerSync not running)
- Enabled Supabase anonymous sign-ins for local dev

## Why

Offline clients need optional cloud sync before Join UI (S28) can fetch shared group data.

## Verify

```bash
npm run verify
```

Local sync stack (ARM: `DOCKER_DEFAULT_PLATFORM=linux/amd64 supabase start -x vector`):

```bash
npm run supabase:reset
npm run powersync:start
npm test -- powersync-sync.test.ts
```

Set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_POWERSYNC_URL` to enable sync in the app.

## Exit criteria

- [x] Env-gated PowerSync connect in app
- [x] Two clients sync one expense (integration test)
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — no connector; schema `localOnly`; integration test missing
2. **GREEN** — connector + sync rules + JWKS auth + insert-based upload + passing integration test

## Tests added

- `sync config › returns null when env vars are missing`
- `sync config › reads EXPO_PUBLIC env vars when present`
- `PowerSync connect › two clients sync one expense when PowerSync is running`

## Manual checklist

- [ ] `npm run powersync:start` after Supabase is up
- [ ] Export Expo env vars → create group in app → appears in Supabase Studio

## Files touched

- `apps/mobile/src/db/` — schema, connector, sync-config, connect-sync, DatabaseProvider
- `powersync/`, `scripts/start-powersync.sh`, `supabase/migrations/`
- `powersync-sync.test.ts`, `package.json`, `supabase/config.toml`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/db/supabase-connector.ts`
2. `powersync/sync-rules.yaml`
3. `powersync-sync.test.ts`

## Next slice

**S28** — Join Group UI.
