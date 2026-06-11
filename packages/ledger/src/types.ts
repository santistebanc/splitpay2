/** Member referenced by ledger math (id only — display names live elsewhere). */
export type LedgerMember = {
  id: string;
};

/** Money a member paid toward an expense (paid-by side). */
export type ExpenseContribution = {
  memberId: string;
  amountCents: number;
};

/** A member's share of an expense cost (paid-for side). */
export type ExpenseAllocation = {
  memberId: string;
};

/**
 * Expense input for balance calculation.
 * Amount is integer cents. Contributions sum to the expense amount.
 * Allocations are fixed when saved; empty allocations is a ledger fallback only
 * (expand to all members in the snapshot passed to calculation — never the live roster).
 */
export type LedgerExpense = {
  id: string;
  amountCents: number;
  contributions: ExpenseContribution[];
  allocations: ExpenseAllocation[];
};
