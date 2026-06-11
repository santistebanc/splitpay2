import type { LedgerExpense, LedgerMember } from "./types";

export type LedgerBalance = {
  memberId: string;
  balanceCents: number;
};

export function computeBalances(
  members: LedgerMember[],
  expenses: LedgerExpense[]
): LedgerBalance[] {
  const balances = new Map<string, number>(
    members.map((member) => [member.id, 0])
  );

  for (const expense of expenses) {
    const allocationIds =
      expense.allocations.length > 0
        ? expense.allocations.map((allocation) => allocation.memberId)
        : members.map((member) => member.id);

    for (const contribution of expense.contributions) {
      balances.set(
        contribution.memberId,
        (balances.get(contribution.memberId) ?? 0) + contribution.amountCents
      );
    }

    const shareCents = expense.amountCents / allocationIds.length;

    for (const memberId of allocationIds) {
      balances.set(memberId, (balances.get(memberId) ?? 0) - shareCents);
    }
  }

  return members
    .map((member) => ({
      memberId: member.id,
      balanceCents: balances.get(member.id) ?? 0,
    }))
    .sort((a, b) => a.balanceCents - b.balanceCents);
}
