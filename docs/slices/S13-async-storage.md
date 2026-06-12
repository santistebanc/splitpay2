# S13 — AsyncStorage known groups

**Status:** Done

> **Note:** Device ID was removed per [ADR 0003](../adr/0003-assumed-member.md). Known groups now supports optional `assumedMemberId` per group.

## What changed

- Added `@react-native-async-storage/async-storage` with injectable `KeyValueStorage` for tests
- `getOrCreateDeviceId()` — stable UUID persisted across reloads
- `getKnownGroups()` / `addKnownGroup()` — local index of opened group ids
- `GroupsScreen` shows device id and known groups; **Open Group** records `demo`

## Why

Anonymous device identity and a lightweight group index before PowerSync (S14+) and the real groups list (S17).

## Verify

```bash
npm run verify
npm run web   # Groups shows Device: <uuid>; reload → same uuid
```

## Exit criteria

- [x] Device id created once and reused on subsequent reads
- [x] Known groups list persisted as JSON
- [x] Vitest uses mock storage (no native AsyncStorage in tests)
- [x] Reload preserves device ID (manual)
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `device-id.test.ts` + `known-groups.test.ts` failed (modules missing)
2. **GREEN** — storage helpers + mock storage + Groups UI

## Tests added

- `getOrCreateDeviceId › creates and persists a new device id`
- `getOrCreateDeviceId › returns the same id on subsequent calls`
- `getOrCreateDeviceId › reuses a stored id without generating a new one`
- `known groups › returns an empty list when nothing is stored`
- `known groups › adds a group id and persists the list`
- `known groups › does not duplicate an existing group id`
- `known groups › appends new group ids`

## Manual checklist

- [ ] `npm run web` — Groups shows **Device:** line with UUID
- [ ] Reload browser — same device id
- [ ] Tap **Open Group** — **Known: demo** appears; reload — still listed

## Files touched

- `apps/mobile/src/lib/` — device-id, known-groups, storage, storage-keys, test/mock-storage
- `apps/mobile/src/screens/GroupsScreen.tsx`
- `apps/mobile/package.json`, `package-lock.json`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/src/lib/device-id.ts`
2. `apps/mobile/src/lib/known-groups.ts`
3. `apps/mobile/src/lib/test/mock-storage.ts`

## Next slice

**S14** — PowerSync local DB + schema migration.
