# SplitPay slices

Micro-slices for gradual, test-driven development. Each slice has a summary in `docs/slices/`.

**Current slice:** S4 — CONTEXT.md glossary

| Slice                                 | Status  | Summary                               |
| ------------------------------------- | ------- | ------------------------------------- |
| [S0](slices/S00-monorepo-skeleton.md) | ✅ Done | npm workspaces, ledger + mobile stubs |
| [S1](slices/S01-tooling.md)           | ✅ Done | Prettier, Husky, lint-staged          |
| [S2](slices/S02-vitest.md)            | ✅ Done | Vitest + test in verify               |
| [S3](slices/S03-github-actions-ci.md) | ✅ Done | GitHub Actions CI                     |
| [S4](slices/S04-context-glossary.md)  | ✅ Done | CONTEXT.md domain glossary            |

## Verify

```bash
npm install
npm run verify
```

`verify` grows stricter each slice. It must pass before a slice is handed off.

When you confirm a slice is good, it gets committed to git (one commit per slice).
