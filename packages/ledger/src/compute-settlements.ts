import type { LedgerBalance } from "./compute-balances";

export type Settlement = {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
};

export function computeSettlements(balances: LedgerBalance[]): Settlement[] {
  const debtors = balances
    .filter((balance) => balance.balanceCents < 0)
    .map((balance) => ({ ...balance }))
    .sort((a, b) => a.balanceCents - b.balanceCents);

  const creditors = balances
    .filter((balance) => balance.balanceCents > 0)
    .map((balance) => ({ ...balance }))
    .sort((a, b) => b.balanceCents - a.balanceCents);

  const settlements: Settlement[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountCents = Math.min(-debtor.balanceCents, creditor.balanceCents);

    settlements.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      amountCents,
    });

    debtor.balanceCents += amountCents;
    creditor.balanceCents -= amountCents;

    if (debtor.balanceCents === 0) {
      debtorIndex++;
    }
    if (creditor.balanceCents === 0) {
      creditorIndex++;
    }
  }

  return settlements;
}
