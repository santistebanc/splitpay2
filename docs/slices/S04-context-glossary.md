# S4 — CONTEXT.md glossary

**Status:** Done

## What changed

- Added `CONTEXT.md` with domain vocabulary from spec §3
- Added `context.test.ts` guarding required terms and no implementation leakage

## Why

Tests and code will use the same words as the product spec. New contributors read `CONTEXT.md` first.

## Verify

```bash
npm run verify
```

Skim `CONTEXT.md` — terms should match how you think about SplitPay.

## Exit criteria

- [x] `CONTEXT.md` defines all §3 concepts
- [x] No implementation tech in `CONTEXT.md`
- [x] `context.test.ts` passes

## RED → GREEN

1. **RED** — `context.test.ts` failed (`CONTEXT.md` missing)
2. **GREEN** — `CONTEXT.md` written with required terms

## Tests added

- `CONTEXT.md › defines core SplitPay domain terms`
- `CONTEXT.md › stays free of implementation details`

## Files touched

- `CONTEXT.md`
- `context.test.ts`
- `docs/SLICES.md`, this file

## Read first

1. `CONTEXT.md` — the whole file (short)
2. `context.test.ts` — which terms are enforced

## Next slice

**S5** — Ledger types (`Member`, `Expense`, `Split` for pure math).
