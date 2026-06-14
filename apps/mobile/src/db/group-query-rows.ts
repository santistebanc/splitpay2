import type { ActivityRecord } from "./list-group-activities";
import type { ExpenseRecord } from "./add-expense";
import type { GroupRecord, MemberRecord } from "./create-group";

export type GroupRow = {
  id: string;
  name: string;
  join_code: string;
  currency: string;
  created_at: string;
};

export type MemberRow = {
  id: string;
  group_id: string;
  display_name: string;
};

export type ExpenseRow = {
  id: string;
  group_id: string;
  amount_cents: number;
  created_at: string;
  note: string;
};

export type ContributionRow = {
  expense_id: string;
  member_id: string;
  amount_cents: number;
};

export type AllocationRow = {
  expense_id: string;
  member_id: string;
};

export type ActivityRow = {
  id: string;
  group_id: string;
  type: string;
  summary: string;
  expense_id: string | null;
  created_at: string;
};

export function mapGroupRow(row: GroupRow): GroupRecord {
  return {
    id: row.id,
    name: row.name,
    joinCode: row.join_code,
    currency: row.currency,
    createdAt: row.created_at,
  };
}

export function mapMemberRow(row: MemberRow): MemberRecord {
  return {
    id: row.id,
    groupId: row.group_id,
    displayName: row.display_name,
  };
}

export function mapActivityRow(row: ActivityRow): ActivityRecord {
  return {
    id: row.id,
    groupId: row.group_id,
    type: row.type,
    summary: row.summary,
    expenseId: row.expense_id,
    createdAt: row.created_at,
  };
}

export function assembleExpenseRecords(
  expenseRows: readonly ExpenseRow[],
  contributionRows: readonly ContributionRow[],
  allocationRows: readonly AllocationRow[]
): ExpenseRecord[] {
  if (expenseRows.length === 0) {
    return [];
  }

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
    id: row.id,
    groupId: row.group_id,
    amountCents: row.amount_cents,
    createdAt: row.created_at,
    note: row.note,
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
