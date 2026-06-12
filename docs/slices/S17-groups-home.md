# S17 — Groups home list from SQLite

**Status:** Done

## What changed

- `listGroups(db)` — returns all groups, newest first
- `initAppDatabase()` + `DatabaseProvider` — opens SQLite at app startup
- `app-database.web.ts` — `@powersync/web` + WA-SQLite workers for Expo web
- `GroupsScreen` — FlatList of group names from SQLite (tap → Group)
- `?e2eSeed=groups-home` — seeds "Ski weekend" for Playwright
- Playwright: `e2e/groups-home.spec.ts`; `npm run verify` now includes `test:e2e`
- Metro resolver + `public/@powersync` worker assets for web PowerSync

## Why

First UI slice wired to real local data; Playwright gate starts here per ROADMAP.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Groups home lists groups from SQLite
- [x] Playwright: seeded group visible
- [x] `npm run verify` green (includes e2e)

## RED → GREEN

1. **RED** — Playwright could not find Groups (PowerSync broke Expo web bundle)
2. **GREEN** — web/native DB split, Metro config, worker assets, list UI

## Tests added

- `listGroups › returns groups newest first`
- `groups-home.spec.ts › shows a seeded group from SQLite on the home screen`

## Manual checklist

- [ ] `npm run web` — empty state shows "No groups yet"
- [ ] Open `http://localhost:8081/?e2eSeed=groups-home` — "Ski weekend" appears
- [ ] Tap group row — navigates to Group screen

## Files touched

- `apps/mobile/src/db/` — list-groups, app-database, DatabaseProvider, e2e-seed
- `apps/mobile/src/screens/GroupsScreen.tsx`, `App.tsx`
- `apps/mobile/metro.config.js`, `app.json`, `public/@powersync/`
- `e2e/`, `playwright.config.ts`, root `package.json`, `.github/workflows/ci.yml`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/screens/GroupsScreen.tsx`
2. `apps/mobile/src/db/app-database.web.ts`
3. `e2e/groups-home.spec.ts`

## Next slice

**S18** — New Group create flow.
