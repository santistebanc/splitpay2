import type { AbstractPowerSyncDatabase } from "@powersync/common";

import { generateJoinCode } from "./join-code";

export type MemberRecord = {
  id: string;
  groupId: string;
  displayName: string;
};

export type GroupRecord = {
  id: string;
  name: string;
  joinCode: string;
  currency: string;
  createdAt: string;
};

export type GroupWithMembers = GroupRecord & {
  members: MemberRecord[];
};

export type CreateGroupInput = {
  name: string;
  currency: string;
  memberNames: readonly string[];
};

type GroupRow = {
  id: string;
  name: string;
  join_code: string;
  currency: string;
  created_at: string;
};

type MemberRow = {
  id: string;
  group_id: string;
  display_name: string;
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

function mapMemberRow(row: MemberRow): MemberRecord {
  return {
    id: row.id,
    groupId: row.group_id,
    displayName: row.display_name,
  };
}

/** Inserts a new group and its initial member roster. */
export async function createGroup(
  db: AbstractPowerSyncDatabase,
  input: CreateGroupInput
): Promise<GroupWithMembers> {
  const groupId = crypto.randomUUID();
  const joinCode = generateJoinCode();
  const createdAt = new Date().toISOString();
  const members = input.memberNames.map((displayName) => ({
    id: crypto.randomUUID(),
    groupId,
    displayName,
  }));

  await db.writeTransaction(async (tx) => {
    await tx.execute(
      `INSERT INTO groups (id, name, join_code, currency, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [groupId, input.name, joinCode, input.currency, createdAt]
    );

    for (const member of members) {
      await tx.execute(
        `INSERT INTO members (id, group_id, display_name)
         VALUES (?, ?, ?)`,
        [member.id, member.groupId, member.displayName]
      );
    }
  });

  return {
    id: groupId,
    name: input.name,
    joinCode,
    currency: input.currency,
    createdAt,
    members,
  };
}

/** Loads a group and its members, or null when the id is unknown. */
export async function getGroup(
  db: AbstractPowerSyncDatabase,
  groupId: string
): Promise<GroupWithMembers | null> {
  const groupRow = await db.getOptional<GroupRow>(
    `SELECT id, name, join_code, currency, created_at
     FROM groups
     WHERE id = ?`,
    [groupId]
  );
  if (!groupRow) {
    return null;
  }

  const memberRows = await db.getAll<MemberRow>(
    `SELECT id, group_id, display_name
     FROM members
     WHERE group_id = ?`,
    [groupId]
  );

  return {
    ...mapGroupRow(groupRow),
    members: memberRows.map(mapMemberRow),
  };
}
