import type { LedgerExpense, LedgerMember } from "./types";

export type LedgerBalance = {
  memberId: string;
  balanceCents: number;
};

/** Split amountCents evenly across allocationIds using integer cents (zero-sum). */
function debitShares(
  amountCents: number,
  allocationIds: string[]
): Map<string, number> {
  const shares = new Map<string, number>();
  const count = allocationIds.length;

  for (let i = 0; i < count; i++) {
    const memberId = allocationIds[i];
    const previousTotal = Math.floor((amountCents * i) / count);
    const currentTotal = Math.floor((amountCents * (i + 1)) / count);
    shares.set(memberId, currentTotal - previousTotal);
  }

  return shares;
}

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

    const shares = debitShares(expense.amountCents, allocationIds);

    for (const [memberId, shareCents] of shares) {
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
