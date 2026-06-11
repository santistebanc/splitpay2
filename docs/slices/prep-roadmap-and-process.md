# Prep — Roadmap & process docs

**Status:** Done

## What changed

- Added `docs/ROADMAP.md` — full S0–S28+ plan with Next pointer (S11)
- Added `docs/PROCESS.md` — TDD workflow, verify gate, handoff rules, new-session pickup
- Added ADRs 0001 (phasing) and 0002 (Contribution/Allocation)
- Updated `docs/SLICES.md` to link roadmap/process; fixed next slice to S11
- Added `roadmap.test.ts` guarding docs exist
- Added `.cursor/rules/splitpay-development.mdc` for new-session pickup

## Why

Slice order and decisions must survive session restarts. Chat context alone is not reliable.

## Verify

```bash
npm run verify
```

New session pickup:

1. `docs/SLICES.md`
2. `docs/ROADMAP.md`
3. `docs/PROCESS.md`

## Exit criteria

- [x] Full upcoming slices listed through S28
- [x] S11 marked as Next
- [x] Process documented (TDD, confirm→commit, summaries)
- [x] ADRs for major forks
- [x] Test guards roadmap files

## Files touched

- `docs/ROADMAP.md`, `docs/PROCESS.md`, `docs/SLICES.md`
- `docs/adr/0001-micro-slices-and-phasing.md`
- `docs/adr/0002-contribution-allocation-model.md`
- `roadmap.test.ts`, `.cursor/rules/splitpay-development.mdc`, this file

## Read first

1. `docs/ROADMAP.md`
2. `docs/PROCESS.md`

## Next slice

**S11** — Expo web shell + Paper M3 theme (see ROADMAP.md)
