# S28 — Join Group UI

**Status:** Done (awaiting confirm)

## What changed

- `apps/mobile/src/db/join-group.ts` — `fetchJoinGroup`, `importJoinedGroup`, `joinGroup` (anonymous auth → edge function → local SQLite)
- `apps/mobile/src/screens/JoinGroupScreen.tsx` — join code + name form; sets assumed member on success
- `supabase/functions/join/index.ts` — inserts `group_memberships` when `Authorization` header present
- `apps/mobile/src/db/sync-config.ts` — `getSupabaseConfig()` (URL + anon key only)
- `e2e/join-group.spec.ts` — Playwright with mocked join API
- `playwright.config.ts` — dummy Supabase env so join button is enabled in e2e

## Why

Second device must join an existing group by code and see it locally before sync can share expenses.

## Verify

```bash
npm run verify
```

63 unit + 10 e2e tests green.

## Exit criteria

- [x] Join Group screen calls edge function and imports group + members locally
- [x] Playwright: join by code → group on home screen
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — Join screen stub; no join repository; e2e missing
2. **GREEN** — join flow + import (insert/update, not UPSERT on PowerSync views) + mocked e2e

## Tests added

- `importJoinedGroup › writes a joined group and members into local SQLite`
- `importJoinedGroup › merges members when the group already exists locally`
- `sync config › getSupabaseConfig returns null when env vars are missing`
- `sync config › getSupabaseConfig reads EXPO_PUBLIC env vars when present`
- `joins a group by code and shows it on the home screen` (e2e)

## Manual checklist

- [ ] Supabase + PowerSync running; env vars set
- [ ] Device A creates group; share join code
- [ ] Device B: Join Group → code + name → group appears; assumed member is joiner

## Files touched

- `apps/mobile/src/db/join-group.ts`, `join-group.test.ts`, `sync-config.ts`, `index.ts`
- `apps/mobile/src/screens/JoinGroupScreen.tsx`
- `supabase/functions/join/index.ts`
- `e2e/join-group.spec.ts`, `playwright.config.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/db/join-group.ts`
2. `apps/mobile/src/screens/JoinGroupScreen.tsx`
3. `e2e/join-group.spec.ts`

## Next slice

Roadmap defined slices complete through S28. See [`ROADMAP.md`](../ROADMAP.md).
