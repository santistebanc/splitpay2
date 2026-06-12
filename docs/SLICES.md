# SplitPay slices

Micro-slices for gradual, test-driven development.

**Next slice:** [S21 — Add Expense screen](./ROADMAP.md#minimal-ui-loop--s17s21) (see [`ROADMAP.md`](./ROADMAP.md) for full plan)

**How we work:** [`PROCESS.md`](./PROCESS.md)

## Completed

| Slice                                      | Summary                                    |
| ------------------------------------------ | ------------------------------------------ |
| [S0](slices/S00-monorepo-skeleton.md)      | npm workspaces, ledger + mobile stubs      |
| [S1](slices/S01-tooling.md)                | Prettier, Husky, lint-staged               |
| [S2](slices/S02-vitest.md)                 | Vitest + test in verify                    |
| [S3](slices/S03-github-actions-ci.md)      | GitHub Actions CI                          |
| [S4](slices/S04-context-glossary.md)       | CONTEXT.md domain glossary                 |
| [S5](slices/S05-ledger-types.md)           | Ledger types (Contribution, Allocation)    |
| [S6](slices/S06-compute-balances.md)       | computeBalances, one expense               |
| [S7](slices/S07-rounding.md)               | 100¢ ÷ 3 zero-sum rounding                 |
| [S8](slices/S08-empty-allocations.md)      | Empty allocations → snapshot members       |
| [S9](slices/S09-compute-settlements.md)    | Greedy settlement matching                 |
| [S10](slices/S10-is-payment.md)            | Payment expense detection                  |
| [S11](slices/S11-expo-web-shell.md)        | Expo web + Paper M3 shell                  |
| [S12](slices/S12-navigation-stubs.md)      | React Navigation stack + screen stubs      |
| [S13](slices/S13-async-storage.md)         | AsyncStorage known groups + assumed member |
| [S14](slices/S14-powersync-schema.md)      | PowerSync local DB + schema                |
| [S15](slices/S15-create-group.md)          | createGroup repository                     |
| [S16](slices/S16-add-expense.md)           | addExpense repository                      |
| [S17](slices/S17-groups-home.md)           | Groups home list from SQLite               |
| [S18](slices/S18-new-group.md)             | New Group create flow                      |
| [S19](slices/S19-group-balances.md)        | Group View balances panel                  |
| [S20](slices/S20-group-expenses.md)        | Group View expenses list                   |
| [Prep](slices/prep-roadmap-and-process.md) | Roadmap, process, ADRs                     |

## Upcoming

See [`ROADMAP.md`](./ROADMAP.md) — **S21** (Add Expense) through **S28** (Join UI).

## Verify

```bash
npm install
npm run verify
```

When you confirm a slice is good, it gets committed to git (one commit per slice).
