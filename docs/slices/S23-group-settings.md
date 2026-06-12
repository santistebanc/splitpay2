# S23 — Group Settings screen

**Status:** Done (awaiting confirm)

## What changed

- `update-group.ts` — `renameGroup`, `addMember`, `renameMember`, `removeMember`, `isMemberReferenced`
- `GroupSettingsScreen` — rename group, manage members, assumed-member picker, exit group
- `GroupsScreen` — lists only groups in the device's known-groups index
- E2E seeds call `addKnownGroup` so Playwright home tests stay valid
- Playwright: `e2e/group-settings.spec.ts` — rename group; exit removes from home

## Why

Users can adjust group metadata and roster locally; exit hides the group on this device without deleting shared SQLite data (per ADR 0003).

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Rename group
- [x] Exit removes group locally (from home list)
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `group-settings.spec.ts` failed (Group Settings was a stub)
2. **GREEN** — settings screen + known-groups filter on Groups home

## Tests added

- `renameGroup › updates the group name`
- `addMember › adds a member to the group roster`
- `renameMember › updates a member display name`
- `removeMember › removes a member with no expense references`
- `removeMember › throws when the member is referenced by an expense`
- `group-settings.spec.ts › renaming a group updates the group view`
- `group-settings.spec.ts › exiting a group removes it from the home screen`

## Manual checklist

- [ ] Settings → rename "Beach trip" to "Summer trip" → Group view title updates
- [ ] Add member Carol; rename Alice to Alicia; remove unreferenced member
- [ ] Remove is disabled for members referenced by expenses
- [ ] Assumed member picker saves None / member choice
- [ ] Exit group → Groups home no longer lists the group

## Files touched

- `apps/mobile/src/db/update-group.ts`, `update-group.test.ts`
- `apps/mobile/src/screens/GroupSettingsScreen.tsx`, `GroupsScreen.tsx`
- `apps/mobile/src/db/e2e-seed.ts`, `db/index.ts`
- `e2e/group-settings.spec.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/screens/GroupSettingsScreen.tsx`
2. `apps/mobile/src/db/update-group.ts`
3. `e2e/group-settings.spec.ts`

## Next slice

**S24** — Activity feed.
