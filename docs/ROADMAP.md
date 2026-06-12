# SplitPay roadmap

Full micro-slice plan. **Source of truth for what comes next.**

Status key: ✅ Done · 🔜 Next · ⏳ Pending

See [`SLICES.md`](./SLICES.md) for links to completed slice summaries.

---

## Foundation ✅ (S0–S4)

| Slice | Summary                      |
| ----- | ---------------------------- |
| S0    | Monorepo skeleton            |
| S1    | Prettier, Husky, lint-staged |
| S2    | Vitest in verify             |
| S3    | GitHub Actions CI            |
| S4    | CONTEXT.md glossary          |

---

## Ledger package ✅ (S5–S10)

| Slice | Summary                                 |
| ----- | --------------------------------------- |
| S5    | Ledger types (Contribution, Allocation) |
| S6    | `computeBalances` — one expense         |
| S7    | Rounding — 100¢ ÷ 3 zero-sum            |
| S8    | Empty allocations → snapshot members    |
| S9    | `computeSettlements` greedy matching    |
| S10   | `isPayment` detection                   |

---

## App shell ⏳ (S11–S13)

| Slice | Status | Summary                                     | Exit criteria                          |
| ----- | ------ | ------------------------------------------- | -------------------------------------- |
| S11   | ✅     | Expo web + Paper M3 + system light/dark     | `npm run web` renders themed shell     |
| S12   | ✅     | React Navigation stack + empty screen stubs | Navigate between route stubs           |
| S13   | ✅     | AsyncStorage: known groups + assumed member | Vitest mock test; per-group assumption |

---

## Local data ⏳ (S14–S16)

| Slice   | Status | Summary                               | Exit criteria                           |
| ------- | ------ | ------------------------------------- | --------------------------------------- |
| **S14** | ✅     | PowerSync local DB + schema migration | Vitest: tables exist, empty             |
| **S15** | ✅     | `createGroup` repository              | Vitest: insert + read back              |
| **S16** | ✅     | `addExpense` repository               | Vitest: expense + allocations persisted |

---

## Minimal UI loop ⏳ (S17–S21)

Per original plan: Groups → New Group → Group View → Add Expense only before Settle/Settings.

| Slice   | Status | Summary                        | Exit criteria                             |
| ------- | ------ | ------------------------------ | ----------------------------------------- |
| **S17** | ✅     | Groups home — list from SQLite | Playwright: seeded group visible          |
| **S18** | ✅     | New Group create flow          | Playwright: create → appears on home      |
| **S19** | ✅     | Group View — balances panel    | Playwright: balances match ledger         |
| **S20** | ✅     | Group View — expenses list     | Playwright: expense row visible           |
| **S21** | ✅     | Add Expense screen             | Playwright: add expense → balances update |

Playwright starts at S17. Manual checklist in each slice doc.

---

## Remaining offline UI ⏳ (S22–S24)

| Slice   | Status      | Summary                          | Exit criteria                               |
| ------- | ----------- | -------------------------------- | ------------------------------------------- |
| **S22** | ✅          | Settle screen                    | Tap Settle → payment expense; balances move |
| **S23** | ✅          | Settings — rename, members, exit | Rename group; exit removes group locally    |
| **S24** | 🔜 **Next** | Activity feed                    | Actions appear in feed                      |

---

## Sync & join ⏳ (S25–S28+)

| Slice | Status | Summary                       | Exit criteria                    |
| ----- | ------ | ----------------------------- | -------------------------------- |
| S25   | ⏳     | `supabase/` migrations        | `supabase db reset` locally      |
| S26   | ⏳     | Edge function: join           | curl test against local Supabase |
| S27   | ⏳     | PowerSync connect (env-gated) | Two clients sync one expense     |
| S28   | ⏳     | Join Group UI                 | Second client joins via code     |

Integration CI: optional job when `SUPABASE_*` secrets configured.

---

## Locked product decisions (see ADRs)

- Tracer-bullet phasing, web-first dev → [`adr/0001-micro-slices-and-phasing.md`](./adr/0001-micro-slices-and-phasing.md)
- Contribution / Allocation naming, allocation snapshot → [`adr/0002-contribution-allocation-model.md`](./adr/0002-contribution-allocation-model.md)
- Assumed member (device-local), no claim slots → [`adr/0003-assumed-member.md`](./adr/0003-assumed-member.md)

---

## Updating this file

When a slice completes:

1. Mark it ✅ in [`SLICES.md`](./SLICES.md)
2. Move 🔜 **Next** to the following slice here
3. Add `docs/slices/SXX-*.md` summary
