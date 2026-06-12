import type { AbstractPowerSyncDatabase } from "@powersync/common";

export type ExpenseContributionRecord = {
  memberId: string;
  amountCents: number;
};

export type ExpenseAllocationRecord = {
  memberId: string;
};

export type ExpenseRecord = {
  id: string;
  groupId: string;
  amountCents: number;
  createdAt: string;
  note: string;
  contributions: ExpenseContributionRecord[];
  allocations: ExpenseAllocationRecord[];
};

export type AddExpenseInput = {
  groupId: string;
  amountCents: number;
  note?: string;
  contributions: readonly ExpenseContributionRecord[];
  allocations: readonly ExpenseAllocationRecord[];
};

type ExpenseRow = {
  id: string;
  group_id: string;
  amount_cents: number;
  created_at: string;
  note: string;
};

type ContributionRow = {
  member_id: string;
  amount_cents: number;
};

type AllocationRow = {
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

/** Inserts an expense with explicit contribution and allocation rows. */
export async function addExpense(
  db: AbstractPowerSyncDatabase,
  input: AddExpenseInput
): Promise<ExpenseRecord> {
  const expenseId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const note = input.note ?? "";

  await db.writeTransaction(async (tx) => {
    await tx.execute(
      `INSERT INTO expenses (id, group_id, amount_cents, created_at, note)
       VALUES (?, ?, ?, ?, ?)`,
      [expenseId, input.groupId, input.amountCents, createdAt, note]
    );

    for (const contribution of input.contributions) {
      await tx.execute(
        `INSERT INTO expense_contributions (id, expense_id, member_id, amount_cents)
         VALUES (?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          expenseId,
          contribution.memberId,
          contribution.amountCents,
        ]
      );
    }

    for (const allocation of input.allocations) {
      await tx.execute(
        `INSERT INTO expense_allocations (id, expense_id, member_id)
         VALUES (?, ?, ?)`,
        [crypto.randomUUID(), expenseId, allocation.memberId]
      );
    }
  });

  return {
    id: expenseId,
    groupId: input.groupId,
    amountCents: input.amountCents,
    createdAt,
    note,
    contributions: input.contributions.map((contribution) => ({
      memberId: contribution.memberId,
      amountCents: contribution.amountCents,
    })),
    allocations: input.allocations.map((allocation) => ({
      memberId: allocation.memberId,
    })),
  };
}

/** Loads an expense with contributions and allocations, or null when missing. */
export async function getExpense(
  db: AbstractPowerSyncDatabase,
  expenseId: string
): Promise<ExpenseRecord | null> {
  const expenseRow = await db.getOptional<ExpenseRow>(
    `SELECT id, group_id, amount_cents, created_at, note
     FROM expenses
     WHERE id = ?`,
    [expenseId]
  );
  if (!expenseRow) {
    return null;
  }

  const contributionRows = await db.getAll<ContributionRow>(
    `SELECT member_id, amount_cents
     FROM expense_contributions
     WHERE expense_id = ?`,
    [expenseId]
  );
  const allocationRows = await db.getAll<AllocationRow>(
    `SELECT member_id
     FROM expense_allocations
     WHERE expense_id = ?`,
    [expenseId]
  );

  return {
    ...mapExpenseRow(expenseRow),
    contributions: contributionRows.map((row) => ({
      memberId: row.member_id,
      amountCents: row.amount_cents,
    })),
    allocations: allocationRows.map((row) => ({
      memberId: row.member_id,
    })),
  };
}
