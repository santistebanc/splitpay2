import type { AbstractPowerSyncDatabase } from "@powersync/common";

import type { ExpenseRecord } from "./add-expense";

type ExpenseRow = {
  id: string;
  group_id: string;
  amount_cents: number;
  created_at: string;
  note: string;
};

type ContributionRow = {
  expense_id: string;
  member_id: string;
  amount_cents: number;
};

type AllocationRow = {
  expense_id: string;
  member_id: string;
};

function mapExpenseRow(
  row: ExpenseRow
): Omit<ExpenseRecord, "contributions" | "allocations"> {
  return {
    id: row.id,
    groupId: row.group_id,
    amountCents: row.amount_cents,
    createdAt: row.created_at,
    note: row.note,
  };
}

/** Lists expenses for a group with contributions and allocations, newest first. */
export async function listGroupExpenses(
  db: AbstractPowerSyncDatabase,
  groupId: string
): Promise<ExpenseRecord[]> {
  const expenseRows = await db.getAll<ExpenseRow>(
    `SELECT id, group_id, amount_cents, created_at, note
     FROM expenses
     WHERE group_id = ?
     ORDER BY created_at DESC`,
    [groupId]
  );

  if (expenseRows.length === 0) {
    return [];
  }

  const expenseIds = expenseRows.map((row) => row.id);
  const placeholders = expenseIds.map(() => "?").join(", ");

  const contributionRows = await db.getAll<ContributionRow>(
    `SELECT expense_id, member_id, amount_cents
     FROM expense_contributions
     WHERE expense_id IN (${placeholders})`,
    expenseIds
  );
  const allocationRows = await db.getAll<AllocationRow>(
    `SELECT expense_id, member_id
     FROM expense_allocations
     WHERE expense_id IN (${placeholders})`,
    expenseIds
  );

  const contributionsByExpense = new Map<string, ContributionRow[]>();
  for (const row of contributionRows) {
    const rows = contributionsByExpense.get(row.expense_id) ?? [];
    rows.push(row);
    contributionsByExpense.set(row.expense_id, rows);
  }

  const allocationsByExpense = new Map<string, AllocationRow[]>();
  for (const row of allocationRows) {
    const rows = allocationsByExpense.get(row.expense_id) ?? [];
    rows.push(row);
    allocationsByExpense.set(row.expense_id, rows);
  }

  return expenseRows.map((row) => ({
    ...mapExpenseRow(row),
    contributions: (contributionsByExpense.get(row.id) ?? []).map(
      (contribution) => ({
        memberId: contribution.member_id,
        amountCents: contribution.amount_cents,
      })
    ),
    allocations: (allocationsByExpense.get(row.id) ?? []).map((allocation) => ({
      memberId: allocation.member_id,
    })),
  }));
}
