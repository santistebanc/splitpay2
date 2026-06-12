# S18 — New Group create flow

**Status:** Done

## What changed

- `NewGroupScreen` — form for group name, currency (default EUR), comma-separated members
- Create calls `createGroup(db, …)` then `addKnownGroup(group.id)` and navigates to Groups home
- Playwright: `e2e/new-group.spec.ts` — fill form → "Beach trip" appears on home

## Why

Users can create groups in the app; home list refreshes on focus after navigate back.

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] New Group form creates a group in SQLite
- [x] Playwright: create → appears on home
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — Playwright could not find `getByLabel('Group name')` (Paper TextInput on web)
2. **GREEN** — `getByRole('textbox')` selectors; full create flow

## Tests added

- `new-group.spec.ts › creates a group and shows it on the home screen`

## Manual checklist

- [ ] Tap **New Group** — form shows name, currency, members fields
- [ ] Create "Beach trip" with Alice, Bob — appears on Groups home
- [ ] Tap created group — navigates to Group screen

## Files touched

- `apps/mobile/src/screens/NewGroupScreen.tsx`
- `e2e/new-group.spec.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/screens/NewGroupScreen.tsx`
2. `e2e/new-group.spec.ts`

## Next slice

**S19** — Group View balances panel.
