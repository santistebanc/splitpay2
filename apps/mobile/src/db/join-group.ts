import type { AbstractPowerSyncDatabase } from "@powersync/common";

import { getGroup } from "./create-group";
import type { GroupWithMembers, MemberRecord } from "./create-group";
import { connectSyncIfConfigured } from "./connect-sync";
import { isValidJoinCode } from "./join-code";
import { getSupabaseClient } from "./supabase-client";
import {
  getSupabaseConfig,
  getSyncConfig,
  type SupabaseConfig,
} from "./sync-config";

export type JoinGroupResult = GroupWithMembers & {
  member: MemberRecord;
};

export type JoinGroupInput = {
  joinCode: string;
  displayName: string;
};

type RawMember = {
  id: string;
  groupId?: string;
  group_id?: string;
  displayName?: string;
  display_name?: string;
};

/** Normalizes join API / PostgREST member shapes into client records. */
export function normalizeMember(raw: RawMember, groupId: string): MemberRecord {
  return {
    id: raw.id,
    groupId: raw.groupId ?? raw.group_id ?? groupId,
    displayName: raw.displayName ?? raw.display_name ?? "",
  };
}

function normalizeJoinedResult(joined: JoinGroupResult): JoinGroupResult {
  const members = joined.members.map((member) =>
    normalizeMember(member, joined.id)
  );
  return {
    ...joined,
    members,
    member: normalizeMember(joined.member, joined.id),
  };
}

async function ensureAccessToken(
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<string> {
  const client = getSupabaseClient({ supabaseUrl, supabaseAnonKey });
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
    group?: JoinGroupResult;
    member?: RawMember;
    members?: RawMember[];
  };

  if (!response.ok) {
    throw new Error(body.error ?? `Join failed (${response.status})`);
  }

  if (!body.group || !body.member || !body.members) {
    throw new Error("Join response was incomplete");
  }

  return normalizeJoinedResult({
    ...body.group,
    member: body.member as MemberRecord,
    members: body.members as MemberRecord[],
  });
}

/** Loads the member roster for a group from Supabase (requires group membership). */
export async function fetchGroupMembersFromServer(
  config: SupabaseConfig,
  groupId: string
): Promise<MemberRecord[]> {
  const client = getSupabaseClient(config);
  const { data, error } = await client
    .from("members")
    .select("id, group_id, display_name")
    .eq("group_id", groupId)
    .order("display_name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    normalizeMember(
      {
        id: row.id,
        group_id: row.group_id,
        display_name: row.display_name,
      },
      groupId
    )
  );
}

async function importRosterOffline(
  db: AbstractPowerSyncDatabase,
  roster: JoinGroupResult
): Promise<void> {
  const wasConnected = db.connected;
  if (wasConnected) {
    await db.disconnect();
  }

  try {
    await importJoinedGroup(db, roster);
  } finally {
    if (wasConnected && getSupabaseConfig()) {
      try {
        await connectSyncIfConfigured(db);
      } catch {
        // Sync stays offline until the next app open.
      }
    }
  }
}

async function syncJoinedGroupLocally(
  db: AbstractPowerSyncDatabase,
  config: SupabaseConfig,
  joined: JoinGroupResult
): Promise<JoinGroupResult> {
  const normalized = normalizeJoinedResult(joined);

  let members = normalized.members;
  try {
    const serverMembers = await fetchGroupMembersFromServer(
      config,
      normalized.id
    );
    if (serverMembers.length > 0) {
      members = serverMembers;
    }
  } catch {
    // Fall back to the join edge function roster.
  }

  const roster: JoinGroupResult = {
    ...normalized,
    members,
    member:
      members.find((member) => member.id === normalized.member.id) ??
      normalized.member,
  };

  await importRosterOffline(db, roster);
  return roster;
}

/**
 * Merges the server member roster into local SQLite when sync cleared it.
 * Call when opening a joined group.
 */
export async function refreshGroupRosterFromServer(
  db: AbstractPowerSyncDatabase,
  groupId: string
): Promise<void> {
  const config = getSupabaseConfig();
  if (!config || !getSyncConfig()) {
    return;
  }

  const existing = await getGroup(db, groupId);
  if (!existing) {
    return;
  }

  let serverMembers: MemberRecord[];
  try {
    serverMembers = await fetchGroupMembersFromServer(config, groupId);
  } catch {
    return;
  }

  if (serverMembers.length === 0) {
    return;
  }

  const localIds = new Set(existing.members.map((member) => member.id));
  const missingOnDevice = serverMembers.some(
    (member) => !localIds.has(member.id)
  );
  if (existing.members.length > 0 && !missingOnDevice) {
    return;
  }

  await importRosterOffline(db, {
    ...existing,
    member: serverMembers[0]!,
    members: serverMembers,
  });
}

/** Upserts a joined group and member roster into local SQLite. */
export async function importJoinedGroup(
  db: AbstractPowerSyncDatabase,
  joined: JoinGroupResult
): Promise<GroupWithMembers> {
  const {
    member: _joinedMember,
    members,
    ...group
  } = normalizeJoinedResult(joined);

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
      const normalized = normalizeMember(member, group.id);
      if (!normalized.displayName) {
        continue;
      }

      const existingMember = await tx.getOptional<{ id: string }>(
        `SELECT id FROM members WHERE id = ?`,
        [normalized.id]
      );

      if (existingMember) {
        await tx.execute(
          `UPDATE members SET group_id = ?, display_name = ? WHERE id = ?`,
          [normalized.groupId, normalized.displayName, normalized.id]
        );
      } else {
        await tx.execute(
          `INSERT INTO members (id, group_id, display_name)
           VALUES (?, ?, ?)`,
          [normalized.id, normalized.groupId, normalized.displayName]
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

  const accessToken = await ensureAccessToken(
    config.supabaseUrl,
    config.supabaseAnonKey
  );
  const joined = await fetchJoinGroup(config, accessToken, input);
  return syncJoinedGroupLocally(db, config, joined);
}
