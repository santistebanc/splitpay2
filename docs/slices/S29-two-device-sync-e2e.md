# S29 — Two-device sync e2e

**Status:** Done (awaiting confirm)

## What changed

- `e2e/two-device-sync.spec.ts` — Playwright: host creates group, guest joins by code, guest sees host expense (real Supabase + join edge function + PowerSync)
- `e2e/helpers/sync-stack.ts` — stack reachability + join code parsing
- `e2e/helpers/groups.ts` — scoped group list locators (avoids hidden stack duplicates)
- `playwright.config.ts` — offline e2e uses Supabase env only; sync e2e adds PowerSync; splits specs via `PLAYWRIGHT_SYNC_E2E`
- `NewGroupScreen.tsx` / `JoinGroupScreen.tsx` — `goBack()` after success (single Groups screen in stack)
- `join-group.ts` — `reconnectSyncIfConfigured` after join so guest sync bucket is ready
- `GroupScreen.tsx` — `group-title` testID for rename e2e
- `.github/workflows/sync-integration.yml` — CI: Supabase + PowerSync + `test:sync` + sync e2e
- `docs/MANUAL-SYNC-TESTING.md` — two-tab manual checklist
- `npm run test:e2e:sync` — run sync e2e only

## Why

Lock in the create → join → expense path that was fixed manually and in `powersync-sync.test.ts`, at the UI layer with two isolated browser contexts.

## Verify

```bash
npm run verify
```

With stack running:

```bash
npm run supabase:reset && npm run powersync:start
npm run test:sync
npm run test:e2e:sync
```

## Exit criteria

- [x] Playwright two-context test skips when stack is down; passes when up
- [x] CI sync-integration workflow runs regression + e2e against local stack
- [x] Manual sync doc + group-settings flake fix
- [x] `npm run verify` green

## Tests added

- `two-device sync › guest sees host expense after join` (e2e)
- CI: `sync-integration` job

## Manual checklist

- [ ] Follow [`MANUAL-SYNC-TESTING.md`](../MANUAL-SYNC-TESTING.md) in two browser tabs

## Files touched

- `e2e/two-device-sync.spec.ts`, `e2e/helpers/sync-stack.ts`, `e2e/helpers/groups.ts`, `e2e/group-settings.spec.ts`
- `apps/mobile/src/screens/GroupsScreen.tsx`, `GroupSettingsScreen.tsx`, `GroupScreen.tsx`, `NewGroupScreen.tsx`, `JoinGroupScreen.tsx`
- `apps/mobile/src/db/join-group.ts`
- `playwright.config.ts`, `package.json`, `ci.test.ts`
- `docs/MANUAL-SYNC-TESTING.md`, `docs/ROADMAP.md`, `docs/SLICES.md`, this file

## Read first

1. `e2e/two-device-sync.spec.ts`
2. `docs/MANUAL-SYNC-TESTING.md`
3. `.github/workflows/sync-integration.yml`

## Next slice

None defined — see [`ROADMAP.md`](../ROADMAP.md).
