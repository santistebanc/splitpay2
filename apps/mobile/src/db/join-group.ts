import type { AbstractPowerSyncDatabase } from "@powersync/common";
import { createClient } from "@supabase/supabase-js";

import type {
  GroupRecord,
  GroupWithMembers,
  MemberRecord,
} from "./create-group";
import { isValidJoinCode } from "./join-code";
import { getSupabaseConfig } from "./sync-config";

export type JoinGroupResult = GroupWithMembers & {
  member: MemberRecord;
};

export type JoinGroupInput = {
  joinCode: string;
  displayName: string;
};

async function ensureSession(
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<string> {
  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) {
    const { error } = await client.auth.signInAnonymously();
    if (error) {
      throw error;
    }
  }

  const { data: nextSession } = await client.auth.getSession();
  const token = nextSession.session?.access_token;
  if (!token) {
    throw new Error("Could not sign in");
  }

  return token;
}

/** Calls the join edge function and returns the server payload. */
export async function fetchJoinGroup(
  config: { supabaseUrl: string; supabaseAnonKey: string },
  accessToken: string,
  input: JoinGroupInput
): Promise<JoinGroupResult> {
  const joinCode = input.joinCode.trim().toUpperCase();
  const displayName = input.displayName.trim();

  if (!isValidJoinCode(joinCode)) {
    throw new Error("Invalid join code");
  }

  if (!displayName) {
    throw new Error("Enter a member name");
  }

  const response = await fetch(`${config.supabaseUrl}/functions/v1/join`, {
    method: "POST",
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ joinCode, displayName }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    group?: GroupRecord;
    member?: MemberRecord;
    members?: MemberRecord[];
  };

  if (!response.ok) {
    throw new Error(body.error ?? `Join failed (${response.status})`);
  }

  if (!body.group || !body.member || !body.members) {
    throw new Error("Join response was incomplete");
  }

  return {
    ...body.group,
    member: body.member,
    members: body.members,
  };
}

/** Upserts a joined group and member roster into local SQLite. */
export async function importJoinedGroup(
  db: AbstractPowerSyncDatabase,
  joined: JoinGroupResult
): Promise<GroupWithMembers> {
  const { member: _joinedMember, members, ...group } = joined;

  await db.writeTransaction(async (tx) => {
    const existingGroup = await tx.getOptional<{ id: string }>(
      `SELECT id FROM groups WHERE id = ?`,
      [group.id]
    );

    if (existingGroup) {
      await tx.execute(
        `UPDATE groups
         SET name = ?, join_code = ?, currency = ?, created_at = ?
         WHERE id = ?`,
        [group.name, group.joinCode, group.currency, group.createdAt, group.id]
      );
    } else {
      await tx.execute(
        `INSERT INTO groups (id, name, join_code, currency, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [group.id, group.name, group.joinCode, group.currency, group.createdAt]
      );
    }

    for (const member of members) {
      const existingMember = await tx.getOptional<{ id: string }>(
        `SELECT id FROM members WHERE id = ?`,
        [member.id]
      );

      if (existingMember) {
        await tx.execute(
          `UPDATE members SET group_id = ?, display_name = ? WHERE id = ?`,
          [member.groupId, member.displayName, member.id]
        );
      } else {
        await tx.execute(
          `INSERT INTO members (id, group_id, display_name)
           VALUES (?, ?, ?)`,
          [member.id, member.groupId, member.displayName]
        );
      }
    }
  });

  return { ...group, members };
}

/** Joins a group by code via Supabase and imports it locally. */
export async function joinGroup(
  db: AbstractPowerSyncDatabase,
  input: JoinGroupInput
): Promise<JoinGroupResult> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Join requires cloud setup");
  }

  const accessToken = await ensureSession(
    config.supabaseUrl,
    config.supabaseAnonKey
  );
  const joined = await fetchJoinGroup(config, accessToken, input);
  await importJoinedGroup(db, joined);

  return joined;
}
