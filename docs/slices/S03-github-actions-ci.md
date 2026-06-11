# S3 — GitHub Actions CI

**Status:** Done

## What changed

- Added `.github/workflows/ci.yml` running `npm ci` then `npm run ci` on push/PR to `main`
- Added `ci.test.ts` ensuring the workflow file exists and invokes `npm run ci`

## Why

Local `npm run ci` and remote CI stay in sync — same gate everywhere.

## Verify

```bash
npm run verify
```

Locally mirrors what GitHub Actions runs:

```bash
npm ci
npm run ci
```

## Exit criteria

- [x] `.github/workflows/ci.yml` exists
- [x] Workflow runs on `push` and `pull_request` to `main`
- [x] `ci.test.ts` passes
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `ci.test.ts` failed (workflow file missing)
2. **GREEN** — `.github/workflows/ci.yml` added

## Test added

- `CI workflow › exists and runs npm run ci on push and pull_request`

## Files touched

- `.github/workflows/ci.yml`
- `ci.test.ts`
- `vitest.config.ts`
- `docs/SLICES.md`, this file

## Read first

1. `.github/workflows/ci.yml` — the full CI pipeline
2. `ci.test.ts` — guards against accidental workflow removal

## Next slice

**S4** — `CONTEXT.md` domain glossary from spec §3.
