# S12 — Navigation stubs

**Status:** Done

## What changed

- Added React Navigation native stack with typed `RootStackParamList`
- Seven empty screen stubs under `src/screens/` matching the offline UI flow
- `GroupsScreen` and `GroupScreen` link to other routes; others use `StubScreen`
- `App.tsx` renders `AppNavigator` inside Paper + SafeArea providers

## Why

Wire up navigation skeleton before AsyncStorage (S13) and SQLite screens (S17+).

## Verify

```bash
npm run verify
npm run web   # Groups → New Group / Open Group / Join Group; Group → Add Expense / Settle Up / Settings
```

## Exit criteria

- [x] Stack navigator with all planned route stubs
- [x] Navigate between routes from Groups and Group
- [x] Back navigation via stack header
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `routes.test.ts` failed (module missing)
2. **GREEN** — routes registry, screens, `AppNavigator`

## Tests added

- `APP_ROUTE_NAMES › lists every planned stub screen for the stack`

## Manual checklist

- [ ] `npm run web` — Groups shows three buttons
- [ ] Tap **Open Group** → see demo group id + three buttons
- [ ] Tap **Add Expense** → stub screen; back returns to Group
- [ ] Back from Group returns to Groups

## Files touched

- `apps/mobile/src/navigation/` — routes, `AppNavigator`
- `apps/mobile/src/screens/` — seven stubs + shared `StubScreen`
- `apps/mobile/App.tsx`, `apps/mobile/package.json`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/navigation/routes.ts`
2. `apps/mobile/src/navigation/AppNavigator.tsx`
3. `apps/mobile/src/screens/GroupsScreen.tsx`

## Next slice

**S13** — AsyncStorage: device ID + known groups list.
