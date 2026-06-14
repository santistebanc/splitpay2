import { useQuery } from "@powersync/react";
import { useMemo } from "react";

import {
  assembleExpenseRecords,
  type ActivityRow,
  type AllocationRow,
  type ContributionRow,
  type ExpenseRow,
  mapActivityRow,
} from "../group-query-rows";

/** Watched group activity rows, newest first. */
export function useGroupActivities(groupId: string) {
  const { data: rows = [], isLoading } = useQuery<ActivityRow>(
    `SELECT id, group_id, type, summary, expense_id, created_at
     FROM activities
     WHERE group_id = ?
     ORDER BY created_at DESC`,
    [groupId]
  );

  const activities = useMemo(() => rows.map(mapActivityRow), [rows]);

  return { activities, isLoading };
}

/** Watched expenses with contributions and allocations for a group. */
export function useGroupExpenses(groupId: string) {
  const { data: expenseRows = [], isLoading: loadingExpenses } =
    useQuery<ExpenseRow>(
      `SELECT id, group_id, amount_cents, created_at, note
       FROM expenses
       WHERE group_id = ?
       ORDER BY created_at DESC`,
      [groupId]
    );
  const { data: contributionRows = [], isLoading: loadingContributions } =
    useQuery<ContributionRow>(
      `SELECT expense_id, member_id, amount_cents
       FROM expense_contributions
       WHERE group_id = ?`,
      [groupId]
    );
  const { data: allocationRows = [], isLoading: loadingAllocations } =
    useQuery<AllocationRow>(
      `SELECT expense_id, member_id
       FROM expense_allocations
       WHERE group_id = ?`,
      [groupId]
    );

  const expenses = useMemo(
    () => assembleExpenseRecords(expenseRows, contributionRows, allocationRows),
    [expenseRows, contributionRows, allocationRows]
  );

  return {
    expenses,
    isLoading: loadingExpenses || loadingContributions || loadingAllocations,
  };
}
