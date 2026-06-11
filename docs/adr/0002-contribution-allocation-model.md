# ADR 0002: Contribution and allocation model

**Status:** Accepted

## Context

Expenses have two sides: who paid (paid-by) and who shares the cost (paid-for). “Split” was overloaded. New members joining must not be charged for old expenses.

## Decision

- **Contribution** — money a member paid toward an expense (`ExpenseContribution`)
- **Allocation** — share of cost assigned to a member (`ExpenseAllocation`)
- **Allocation snapshot** — allocations persisted explicitly at save time; empty allocations in ledger is a rare fallback using the **member snapshot passed to calculation**, not the live group roster
- Future **multi-payer**: multiple contributions summing to `amountCents`; allocations unchanged conceptually

## Consequences

- Code and `CONTEXT.md` use Contribution/Allocation; “Split” remains UI language only
- Repository layer must expand “all members selected” to explicit allocation rows on save
- `computeBalances` callers must pass the correct member snapshot per expense
