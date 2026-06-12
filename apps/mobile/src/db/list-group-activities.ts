import type { AbstractPowerSyncDatabase } from "@powersync/common";

export type ActivityRecord = {
  id: string;
  groupId: string;
  type: string;
  summary: string;
  expenseId: string | null;
  createdAt: string;
};

type ActivityRow = {
  id: string;
  group_id: string;
  type: string;
  summary: string;
  expense_id: string | null;
  created_at: string;
};

function mapActivityRow(row: ActivityRow): ActivityRecord {
  return {
    id: row.id,
    groupId: row.group_id,
    type: row.type,
    summary: row.summary,
    expenseId: row.expense_id,
    createdAt: row.created_at,
  };
}

/** Lists group activity newest first. */
export async function listGroupActivities(
  db: AbstractPowerSyncDatabase,
  groupId: string
): Promise<ActivityRecord[]> {
  const rows = await db.getAll<ActivityRow>(
    `SELECT id, group_id, type, summary, expense_id, created_at
     FROM activities
     WHERE group_id = ?
     ORDER BY created_at DESC`,
    [groupId]
  );

  return rows.map(mapActivityRow);
}
