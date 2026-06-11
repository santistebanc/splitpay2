# S2 — Vitest

**Status:** Done

## What changed

- Added Vitest with root `vitest.config.ts`
- First smoke test in `packages/ledger` proves the test runner resolves workspace code
- `test` script runs `vitest run`; `verify` and pre-commit now include tests

## Why

Establishes the TDD loop: every future slice adds a failing test first, then implementation.

## Verify

```bash
npm run verify
```

Or run tests alone:

```bash
npm run test
```

## Exit criteria

- [x] `npm run test` runs Vitest and passes
- [x] `npm run verify` includes test
- [x] Pre-commit hook runs tests

## RED → GREEN

1. **RED** — `packages/ledger/src/index.test.ts` added; `npm run test` failed (no Vitest)
2. **GREEN** — Vitest installed, configured, test passes

## Test added

- `ledger workspace › is ready for behavior-driven tests`

## Files touched

- `package.json`, `package-lock.json`
- `vitest.config.ts`
- `packages/ledger/src/index.test.ts`
- `.husky/pre-commit`
- `docs/SLICES.md`, this file

## Read first

1. `vitest.config.ts` — where tests are discovered
2. `packages/ledger/src/index.test.ts` — first test pattern to follow
3. `package.json` — `test` and `verify` scripts

## Next slice

**S3** — GitHub Actions CI workflow mirroring `npm run ci`.
