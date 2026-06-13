import type { AbstractPowerSyncDatabase } from "@powersync/common";
import { isPayment } from "@splitpay/ledger";

import { formatExpenseActivitySummary } from "../lib/format-expense-activity";

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

type MemberNameRow = {
  id: string;
  display_name: string;
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

  const expenseRecord: ExpenseRecord = {
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

  await db.writeTransaction(async (tx) => {
    await tx.execute(
      `INSERT INTO expenses (id, group_id, amount_cents, created_at, note)
       VALUES (?, ?, ?, ?, ?)`,
      [expenseId, input.groupId, input.amountCents, createdAt, note]
    );

    for (const contribution of input.contributions) {
      await tx.execute(
        `INSERT INTO expense_contributions (id, expense_id, member_id, amount_cents, group_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          expenseId,
          contribution.memberId,
          contribution.amountCents,
          input.groupId,
        ]
      );
    }

    for (const allocation of input.allocations) {
      await tx.execute(
        `INSERT INTO expense_allocations (id, expense_id, member_id, group_id)
         VALUES (?, ?, ?, ?)`,
        [crypto.randomUUID(), expenseId, allocation.memberId, input.groupId]
      );
    }

    const groupRow = await tx.getOptional<{ currency: string }>(
      `SELECT currency FROM groups WHERE id = ?`,
      [input.groupId]
    );
    const memberRows = await tx.getAll<MemberNameRow>(
      `SELECT id, display_name FROM members WHERE group_id = ?`,
      [input.groupId]
    );
    const memberNames = new Map(
      memberRows.map((row) => [row.id, row.display_name])
    );
    const summary = formatExpenseActivitySummary(
      expenseRecord,
      memberNames,
      groupRow?.currency ?? "EUR"
    );
    const activityType = isPayment({
      id: expenseId,
      amountCents: input.amountCents,
      contributions: expenseRecord.contributions,
      allocations: expenseRecord.allocations,
    })
      ? "payment_recorded"
      : "expense_added";

    await tx.execute(
      `INSERT INTO activities (id, group_id, type, summary, expense_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        input.groupId,
        activityType,
        summary,
        expenseId,
        createdAt,
      ]
    );
  });

  return expenseRecord;
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
