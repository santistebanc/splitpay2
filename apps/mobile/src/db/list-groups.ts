import type { AbstractPowerSyncDatabase } from "@powersync/common";

import type { GroupRecord } from "./create-group";

type GroupRow = {
  id: string;
  name: string;
  join_code: string;
  currency: string;
  created_at: string;
};

function mapGroupRow(row: GroupRow): GroupRecord {
  return {
    id: row.id,
    name: row.name,
    joinCode: row.join_code,
    currency: row.currency,
    createdAt: row.created_at,
  };
}

/** Lists all groups, newest first. */
export async function listGroups(
  db: AbstractPowerSyncDatabase
): Promise<GroupRecord[]> {
  const rows = await db.getAll<GroupRow>(
    `SELECT id, name, join_code, currency, created_at
     FROM groups
     ORDER BY created_at DESC`
  );

  return rows.map(mapGroupRow);
}
