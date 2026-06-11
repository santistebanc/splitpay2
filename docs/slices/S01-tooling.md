# S1 — Tooling (Prettier, Husky, lint-staged)

**Status:** Done

## What changed

- Added Prettier with root config and ignore file
- Added lint-staged to format staged files on commit
- Added Husky pre-commit hook: lint-staged → typecheck
- `format` / `format:check` scripts; `format:check` joined to `verify`

## Why

Catches formatting drift before review and keeps commits consistently formatted.

## Verify

```bash
npm run verify
```

Also smoke-test the hook:

```bash
# after staging a change
git commit -m "test"   # runs lint-staged + typecheck
```

## Exit criteria

- [x] `npm run format:check` passes
- [x] `npm run verify` includes format check
- [x] `.husky/pre-commit` runs lint-staged and typecheck
- [x] `prepare` script runs husky on install

## RED → GREEN

1. **RED** — `format:check` added to `verify` (would fail on unformatted files)
2. **GREEN** — Prettier config + `npm run format` on repo

## Files touched

- `package.json`, `package-lock.json`
- `.prettierrc`, `.prettierignore`, `.lintstagedrc.json`
- `.husky/pre-commit`
- `docs/SLICES.md`, this file

## Read first

1. `package.json` — `format`, `format:check`, `verify` scripts
2. `.husky/pre-commit` — what runs on commit
3. `.lintstagedrc.json` — staged-file formatting

## Next slice

**S2** — Vitest; real `test` script joins `verify` and pre-commit.
