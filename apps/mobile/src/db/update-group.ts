import type { AbstractPowerSyncDatabase } from "@powersync/common";

import type { GroupRecord, MemberRecord } from "./create-group";
import { getGroup } from "./create-group";

type MemberRow = {
  id: string;
  group_id: string;
  display_name: string;
};

function mapMemberRow(row: MemberRow): MemberRecord {
  return {
    id: row.id,
    groupId: row.group_id,
    displayName: row.display_name,
  };
}

/** Returns whether a member appears in any expense contribution or allocation. */
export async function isMemberReferenced(
  db: AbstractPowerSyncDatabase,
  memberId: string
): Promise<boolean> {
  const contribution = await db.getOptional<{ member_id: string }>(
    `SELECT member_id
     FROM expense_contributions
     WHERE member_id = ?
     LIMIT 1`,
    [memberId]
  );
  if (contribution) {
    return true;
  }

  const allocation = await db.getOptional<{ member_id: string }>(
    `SELECT member_id
     FROM expense_allocations
     WHERE member_id = ?
     LIMIT 1`,
    [memberId]
  );

  return allocation !== null;
}

/** Updates a group's display name. */
export async function renameGroup(
  db: AbstractPowerSyncDatabase,
  groupId: string,
  name: string
): Promise<GroupRecord> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Enter a group name");
  }

  const group = await getGroup(db, groupId);
  if (!group) {
    throw new Error(`Unknown group: ${groupId}`);
  }

  await db.writeTransaction(async (tx) => {
    await tx.execute(`UPDATE groups SET name = ? WHERE id = ?`, [
      trimmed,
      groupId,
    ]);
  });

  return { ...group, name: trimmed };
}

/** Adds a member to a group's roster. */
export async function addMember(
  db: AbstractPowerSyncDatabase,
  groupId: string,
  displayName: string
): Promise<MemberRecord> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error("Enter a member name");
  }

  const group = await getGroup(db, groupId);
  if (!group) {
    throw new Error(`Unknown group: ${groupId}`);
  }

  const member: MemberRecord = {
    id: crypto.randomUUID(),
    groupId,
    displayName: trimmed,
  };

  await db.writeTransaction(async (tx) => {
    await tx.execute(
      `INSERT INTO members (id, group_id, display_name)
       VALUES (?, ?, ?)`,
      [member.id, member.groupId, member.displayName]
    );
  });

  return member;
}

/** Updates a member's display name. */
export async function renameMember(
  db: AbstractPowerSyncDatabase,
  memberId: string,
  displayName: string
): Promise<MemberRecord> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error("Enter a member name");
  }

  const row = await db.getOptional<MemberRow>(
    `SELECT id, group_id, display_name
     FROM members
     WHERE id = ?`,
    [memberId]
  );
  if (!row) {
    throw new Error(`Unknown member: ${memberId}`);
  }

  await db.writeTransaction(async (tx) => {
    await tx.execute(`UPDATE members SET display_name = ? WHERE id = ?`, [
      trimmed,
      memberId,
    ]);
  });

  return mapMemberRow({ ...row, display_name: trimmed });
}

/** Removes a member when they are not referenced by any expense. */
export async function removeMember(
  db: AbstractPowerSyncDatabase,
  memberId: string
): Promise<void> {
  const row = await db.getOptional<MemberRow>(
    `SELECT id, group_id, display_name
     FROM members
     WHERE id = ?`,
    [memberId]
  );
  if (!row) {
    throw new Error(`Unknown member: ${memberId}`);
  }

  if (await isMemberReferenced(db, memberId)) {
    throw new Error("Member is referenced by expenses");
  }

  await db.writeTransaction(async (tx) => {
    await tx.execute(`DELETE FROM members WHERE id = ?`, [memberId]);
  });
}
