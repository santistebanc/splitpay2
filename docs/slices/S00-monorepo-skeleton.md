# S0 — Monorepo skeleton

**Status:** Done

## What changed

- Added npm workspaces root with `apps/mobile` and `packages/ledger`
- Ledger package exports a marker constant (`LEDGER_READY`)
- Mobile app imports ledger — proves cross-package resolution
- Root `verify` / `ci` / `typecheck` scripts (typecheck runs in each workspace)

## Why

Establishes the two-package layout agreed in planning before any tooling, tests, or UI land.

## Verify

```bash
npm install
npm run verify
```

Exit code 0 means workspaces install and typecheck passes.

## Exit criteria

- [x] `npm install` succeeds
- [x] `npm run verify` exits 0
- [x] `@splitpay/mobile` imports `@splitpay/ledger` without error

## Files touched

- `package.json` — workspaces + scripts
- `apps/mobile/tsconfig.json`, `packages/ledger/tsconfig.json`
- `packages/ledger/` — stub package
- `apps/mobile/` — stub app importing ledger
- `.gitignore`
- `docs/SLICES.md`, this file

## Read first

1. `package.json` — workspace layout and scripts
2. `apps/mobile/src/index.ts` — cross-package import
3. `packages/ledger/src/index.ts` — ledger entry point

## Next slice

**S1** — Prettier, Husky, lint-staged; `format:check` joins `verify`.
