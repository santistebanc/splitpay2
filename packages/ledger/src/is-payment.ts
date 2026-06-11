import type { LedgerExpense } from "./types";

/** Settle-up expense: one contributor, one allocation to a different member. */
export function isPayment(expense: LedgerExpense): boolean {
  if (expense.contributions.length !== 1 || expense.allocations.length !== 1) {
    return false;
  }

  const contributorId = expense.contributions[0].memberId;
  const allocatedMemberId = expense.allocations[0].memberId;

  return contributorId !== allocatedMemberId;
}
