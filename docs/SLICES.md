# SplitPay slices

Micro-slices for gradual, test-driven development.

**Next slice:** [S11 — Expo web shell](./ROADMAP.md#app-shell--s11s13) (see [`ROADMAP.md`](./ROADMAP.md) for full plan)

**How we work:** [`PROCESS.md`](./PROCESS.md)

## Completed

| Slice                                      | Summary                                 |
| ------------------------------------------ | --------------------------------------- |
| [S0](slices/S00-monorepo-skeleton.md)      | npm workspaces, ledger + mobile stubs   |
| [S1](slices/S01-tooling.md)                | Prettier, Husky, lint-staged            |
| [S2](slices/S02-vitest.md)                 | Vitest + test in verify                 |
| [S3](slices/S03-github-actions-ci.md)      | GitHub Actions CI                       |
| [S4](slices/S04-context-glossary.md)       | CONTEXT.md domain glossary              |
| [S5](slices/S05-ledger-types.md)           | Ledger types (Contribution, Allocation) |
| [S6](slices/S06-compute-balances.md)       | computeBalances, one expense            |
| [S7](slices/S07-rounding.md)               | 100¢ ÷ 3 zero-sum rounding              |
| [S8](slices/S08-empty-allocations.md)      | Empty allocations → snapshot members    |
| [S9](slices/S09-compute-settlements.md)    | Greedy settlement matching              |
| [S10](slices/S10-is-payment.md)            | Payment expense detection               |
| [Prep](slices/prep-roadmap-and-process.md) | Roadmap, process, ADRs                  |

## Upcoming

See [`ROADMAP.md`](./ROADMAP.md) — **S11** (Expo + Paper M3) through **S28** (Join UI).

## Verify

```bash
npm install
npm run verify
```

When you confirm a slice is good, it gets committed to git (one commit per slice).
