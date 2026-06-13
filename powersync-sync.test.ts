import { describe, expect, it } from "vitest";
import type { PowerSyncDatabase } from "@powersync/common";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Integration tests against local Supabase + PowerSync.
 * Skips when the stack is not running. To execute:
 *
 *   npm run supabase:reset && npm run powersync:start
 *   npm test -- powersync-sync.test.ts
 */

import { addExpense } from "./apps/mobile/src/db/add-expense.js";
import { createGroup } from "./apps/mobile/src/db/create-group.js";
import type { GroupWithMembers } from "./apps/mobile/src/db/create-group.js";
import { flushPendingUploads } from "./apps/mobile/src/db/connect-sync.js";
import { createSupabaseConnector } from "./apps/mobile/src/db/supabase-connector.js";
import {
  ensureSupabaseSession,
  getSupabaseClient,
} from "./apps/mobile/src/db/supabase-client.js";
import { getSyncConfig } from "./apps/mobile/src/db/sync-config.js";
import {
  closeTestDatabase,
  openTestDatabase,
  type TestDatabase,
} from "./apps/mobile/src/db/test-database.js";

const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";
const LOCAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const LOCAL_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const LOCAL_POWERSYNC_URL = "http://127.0.0.1:8080";

function configureLocalSyncEnv(): void {
  process.env.EXPO_PUBLIC_SUPABASE_URL = LOCAL_SUPABASE_URL;
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = LOCAL_ANON_KEY;
  process.env.EXPO_PUBLIC_POWERSYNC_URL = LOCAL_POWERSYNC_URL;
}

async function isPowerSyncRunning(): Promise<boolean> {
  try {
    const response = await fetch(LOCAL_POWERSYNC_URL);
    return response.status < 500;
  } catch {
    return false;
  }
}

async function isSupabaseRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: LOCAL_ANON_KEY },
    });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function isSyncStackRunning(): Promise<boolean> {
  return (await isPowerSyncRunning()) && (await isSupabaseRunning());
}

async function waitForSync(db: PowerSyncDatabase): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (db.currentStatus.connected && db.currentStatus.hasSynced) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error("Timed out waiting for PowerSync");
}

async function waitForLocalRows(
  db: PowerSyncDatabase,
  sql: string,
  parameters: readonly unknown[],
  expectedCount: number
): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt++) {
    const rows = await db.getAll<{ id: string }>(sql, [...parameters]);
    if (rows.length >= expectedCount) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${expectedCount} local rows`);
}

async function flushUploads(
  db: PowerSyncDatabase,
  connector: ReturnType<typeof createSupabaseConnector>
): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      await connector.uploadData(db);
    } catch (error) {
      throw new Error(`Upload failed: ${String(error)}`, { cause: error });
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function expectServerRoster(
  admin: SupabaseClient,
  created: GroupWithMembers,
  hostUserId: string
): Promise<void> {
  const members = await admin
    .from("members")
    .select("id, display_name")
    .eq("group_id", created.id)
    .order("display_name");
  expect(members.error).toBeNull();
  expect(members.data).toEqual([
    {
      id: created.members[0]!.id,
      display_name: created.members[0]!.displayName,
    },
    {
      id: created.members[1]!.id,
      display_name: created.members[1]!.displayName,
    },
  ]);

  const memberships = await admin
    .from("group_memberships")
    .select("user_id, group_id")
    .eq("group_id", created.id);
  expect(memberships.error).toBeNull();
  expect(memberships.data).toHaveLength(1);
  expect(memberships.data![0]?.user_id).toBe(hostUserId);
  expect(memberships.data![0]?.group_id).toBe(created.id);
}

describe("PowerSync connect", () => {
  it("returns null when sync env vars are missing", () => {
    const saved = { ...process.env };
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.EXPO_PUBLIC_POWERSYNC_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.POWERSYNC_URL;

    expect(getSyncConfig()).toBeNull();

    process.env = saved;
  });
});

describe("PowerSync integration", () => {
  it("two clients sync one expense when PowerSync is running", async () => {
    if (!(await isSyncStackRunning())) {
      return;
    }

    configureLocalSyncEnv();
    const config = getSyncConfig();
    expect(config).not.toBeNull();

    const admin = createClient(LOCAL_SUPABASE_URL, LOCAL_SERVICE_ROLE_KEY);
    const userOne = createClient(LOCAL_SUPABASE_URL, LOCAL_ANON_KEY);
    const userTwo = createClient(LOCAL_SUPABASE_URL, LOCAL_ANON_KEY);

    const sessionOne = await userOne.auth.signInAnonymously();
    const sessionTwo = await userTwo.auth.signInAnonymously();
    expect(sessionOne.error).toBeNull();
    expect(sessionTwo.error).toBeNull();

    const connectorOne = createSupabaseConnector(config!, userOne);
    const connectorTwo = createSupabaseConnector(config!, userTwo);

    let testDbOne: TestDatabase | undefined;
    let testDbTwo: TestDatabase | undefined;

    try {
      testDbOne = await openTestDatabase("sync-a");
      testDbTwo = await openTestDatabase("sync-b");
      const dbOne = testDbOne.db;
      const dbTwo = testDbTwo.db;

      await dbOne.connect(connectorOne);
      await waitForSync(dbOne);

      const created = await createGroup(dbOne, {
        name: "Sync test",
        currency: "EUR",
        memberNames: ["Alice", "Bob"],
      });

      const expense = await addExpense(dbOne, {
        groupId: created.id,
        amountCents: 1200,
        note: "Lunch",
        contributions: [
          { memberId: created.members[0]!.id, amountCents: 1200 },
        ],
        allocations: created.members.map((member) => ({
          memberId: member.id,
        })),
      });

      const pendingUpload = await dbOne.getNextCrudTransaction();
      expect(pendingUpload?.crud.length ?? 0).toBeGreaterThan(0);

      await flushUploads(dbOne, connectorOne);
      await expectServerRoster(admin, created, sessionOne.data.user!.id);

      await admin.from("group_memberships").insert({
        user_id: sessionTwo.data.user!.id,
        group_id: created.id,
      });

      await dbTwo.disconnect();
      await dbTwo.connect(connectorTwo);
      await waitForSync(dbTwo);
      await waitForLocalRows(
        dbTwo,
        `SELECT id FROM expenses WHERE id = ?`,
        [expense.id],
        1
      );

      const rows = await dbTwo.getAll<{ id: string; note: string }>(
        `SELECT id, note FROM expenses WHERE id = ?`,
        [expense.id]
      );
      expect(rows).toHaveLength(1);
      expect(rows[0]?.note).toBe("Lunch");
    } finally {
      if (testDbOne) {
        await closeTestDatabase(testDbOne.db, testDbOne.dbPath);
      }
      if (testDbTwo) {
        await closeTestDatabase(testDbTwo.db, testDbTwo.dbPath);
      }
    }
  }, 120_000);
});

describe("PowerSync regression", () => {
  it("uploads members and host membership on fresh group create", async () => {
    if (!(await isSyncStackRunning())) {
      return;
    }

    configureLocalSyncEnv();
    const config = getSyncConfig();
    expect(config).not.toBeNull();

    const admin = createClient(LOCAL_SUPABASE_URL, LOCAL_SERVICE_ROLE_KEY);
    await ensureSupabaseSession(config!);
    const client = getSupabaseClient(config!);
    const session = await client.auth.getSession();
    expect(session.data.session?.user).toBeDefined();

    const connector = createSupabaseConnector(config!, client);

    let testDb: TestDatabase | undefined;

    try {
      testDb = await openTestDatabase("regression-fresh-group");
      const db = testDb.db;

      await db.connect(connector);
      await waitForSync(db);

      const created = await createGroup(db, {
        name: "Weekend trip",
        currency: "EUR",
        memberNames: ["Alice", "Bob"],
      });

      await flushPendingUploads(db);

      const groups = await admin
        .from("groups")
        .select("id")
        .eq("id", created.id);
      expect(groups.error).toBeNull();
      expect(groups.data).toHaveLength(1);

      await expectServerRoster(admin, created, session.data.session!.user.id);
    } finally {
      if (testDb) {
        await closeTestDatabase(testDb.db, testDb.dbPath);
      }
    }
  }, 120_000);

  it("uploads members when the group row already exists on the server", async () => {
    if (!(await isSyncStackRunning())) {
      return;
    }

    configureLocalSyncEnv();
    const config = getSyncConfig();
    expect(config).not.toBeNull();

    const admin = createClient(LOCAL_SUPABASE_URL, LOCAL_SERVICE_ROLE_KEY);
    await ensureSupabaseSession(config!);
    const client = getSupabaseClient(config!);
    const session = await client.auth.getSession();
    expect(session.data.session?.user).toBeDefined();

    const connector = createSupabaseConnector(config!, client);

    let testDb: TestDatabase | undefined;

    try {
      testDb = await openTestDatabase("regression-partial-group");
      const db = testDb.db;

      await db.connect(connector);
      await waitForSync(db);

      const created = await createGroup(db, {
        name: "Partial upload",
        currency: "EUR",
        memberNames: ["Alice", "Bob"],
      });

      await admin.from("groups").insert({
        id: created.id,
        name: created.name,
        join_code: created.joinCode,
        currency: created.currency,
        created_at: created.createdAt,
      });

      await flushPendingUploads(db);

      await expectServerRoster(admin, created, session.data.session!.user.id);
    } finally {
      if (testDb) {
        await closeTestDatabase(testDb.db, testDb.dbPath);
      }
    }
  }, 120_000);

  it("syncs roster and expenses to a second connected client without reconnect", async () => {
    if (!(await isSyncStackRunning())) {
      return;
    }

    configureLocalSyncEnv();
    const config = getSyncConfig();
    expect(config).not.toBeNull();

    const admin = createClient(LOCAL_SUPABASE_URL, LOCAL_SERVICE_ROLE_KEY);
    const userOne = createClient(LOCAL_SUPABASE_URL, LOCAL_ANON_KEY);
    const userTwo = createClient(LOCAL_SUPABASE_URL, LOCAL_ANON_KEY);

    const sessionOne = await userOne.auth.signInAnonymously();
    const sessionTwo = await userTwo.auth.signInAnonymously();
    expect(sessionOne.error).toBeNull();
    expect(sessionTwo.error).toBeNull();

    const connectorOne = createSupabaseConnector(config!, userOne);
    const connectorTwo = createSupabaseConnector(config!, userTwo);

    let testDbOne: TestDatabase | undefined;
    let testDbTwo: TestDatabase | undefined;

    try {
      testDbOne = await openTestDatabase("regression-live-a");
      testDbTwo = await openTestDatabase("regression-live-b");
      const dbOne = testDbOne.db;
      const dbTwo = testDbTwo.db;

      await dbOne.connect(connectorOne);
      await dbTwo.connect(connectorTwo);
      await waitForSync(dbOne);
      await waitForSync(dbTwo);

      const created = await createGroup(dbOne, {
        name: "Live sync",
        currency: "EUR",
        memberNames: ["Alice", "Bob"],
      });

      await flushUploads(dbOne, connectorOne);
      await expectServerRoster(admin, created, sessionOne.data.user!.id);

      await admin.from("group_memberships").insert({
        user_id: sessionTwo.data.user!.id,
        group_id: created.id,
      });

      await waitForLocalRows(
        dbTwo,
        `SELECT id FROM members WHERE group_id = ?`,
        [created.id],
        2
      );

      const expense = await addExpense(dbOne, {
        groupId: created.id,
        amountCents: 900,
        note: "Coffee",
        contributions: [{ memberId: created.members[0]!.id, amountCents: 900 }],
        allocations: created.members.map((member) => ({
          memberId: member.id,
        })),
      });

      await flushUploads(dbOne, connectorOne);

      await waitForLocalRows(
        dbTwo,
        `SELECT id FROM expenses WHERE id = ?`,
        [expense.id],
        1
      );

      const rows = await dbTwo.getAll<{ note: string }>(
        `SELECT note FROM expenses WHERE id = ?`,
        [expense.id]
      );
      expect(rows[0]?.note).toBe("Coffee");
    } finally {
      if (testDbOne) {
        await closeTestDatabase(testDbOne.db, testDbOne.dbPath);
      }
      if (testDbTwo) {
        await closeTestDatabase(testDbTwo.db, testDbTwo.dbPath);
      }
    }
  }, 120_000);
});
