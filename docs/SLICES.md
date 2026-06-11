# SplitPay slices

Micro-slices for gradual, test-driven development. Each slice has a summary in `docs/slices/`.

**Current slice:** S0 — Monorepo skeleton

| Slice | Status | Summary |
|-------|--------|---------|
| [S0](slices/S00-monorepo-skeleton.md) | ✅ Done | npm workspaces, ledger + mobile stubs |
| S1 | Pending | Prettier, Husky, lint-staged |
| S2 | Pending | Vitest + test script in verify |
| S3 | Pending | GitHub Actions CI |
| S4 | Pending | CONTEXT.md glossary |

## Verify

```bash
npm install
npm run verify
```

`verify` grows stricter each slice. It must pass before a slice is handed off.

When you confirm a slice is good, it gets committed to git (one commit per slice).
