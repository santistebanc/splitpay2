import { isPayment } from "@splitpay/ledger";

import type { ExpenseRecord } from "../db/add-expense";
import { formatAmountCents } from "./format-balance";

type ExpenseForSummary = Pick<
  ExpenseRecord,
  "amountCents" | "note" | "contributions" | "allocations"
>;

/** Builds a human-readable activity line for a saved expense. */
export function formatExpenseActivitySummary(
  expense: ExpenseForSummary,
  memberNames: ReadonlyMap<string, string>,
  currency: string
): string {
  const contributorId = expense.contributions[0]?.memberId;
  const contributorName =
    memberNames.get(contributorId ?? "") ?? contributorId ?? "Someone";
  const amount = formatAmountCents(expense.amountCents, currency);
  const ledgerExpense = {
    id: "",
    amountCents: expense.amountCents,
    contributions: expense.contributions,
    allocations: expense.allocations,
  };

  if (isPayment(ledgerExpense)) {
    const recipientId = expense.allocations[0]?.memberId;
    const recipientName =
      memberNames.get(recipientId ?? "") ?? recipientId ?? "someone";
    return `${contributorName} paid ${recipientName} ${amount}`;
  }

  const note = expense.note.trim();
  if (note) {
    return `${contributorName} paid ${amount} for ${note}`;
  }

  return `${contributorName} paid ${amount}`;
}
