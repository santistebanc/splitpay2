import { afterEach, describe, expect, it } from "vitest";

import { createGroup, getGroup } from "./create-group.js";
import {
  importJoinedGroup,
  normalizeMember,
  type JoinGroupResult,
} from "./join-group.js";
import {
  closeTestDatabase,
  openTestDatabase,
  type TestDatabase,
} from "./test-database.js";

describe("normalizeMember", () => {
  it("maps snake_case fields from PostgREST", () => {
    expect(
      normalizeMember(
        {
          id: "member-bob",
          group_id: "group-joined",
          display_name: "Bob",
        },
        "group-joined"
      )
    ).toEqual({
      id: "member-bob",
      groupId: "group-joined",
      displayName: "Bob",
    });
  });
});

describe("importJoinedGroup", () => {
  let testDb: TestDatabase | undefined;

  afterEach(async () => {
    if (testDb) {
      await closeTestDatabase(testDb.db, testDb.dbPath);
      testDb = undefined;
    }
  });

  it("writes a joined group and members into local SQLite", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;

    const joined: JoinGroupResult = {
      id: "group-joined",
      name: "Weekend trip",
      joinCode: "ABCD2",
      currency: "EUR",
      createdAt: "2026-06-13T00:00:00.000Z",
      member: {
        id: "member-bob",
        groupId: "group-joined",
        displayName: "Bob",
      },
      members: [
        {
          id: "member-alice",
          groupId: "group-joined",
          displayName: "Alice",
        },
        {
          id: "member-bob",
          groupId: "group-joined",
          displayName: "Bob",
        },
      ],
    };

    await importJoinedGroup(db, joined);

    const loaded = await getGroup(db, "group-joined");
    expect(loaded).toEqual({
      id: "group-joined",
      name: "Weekend trip",
      joinCode: "ABCD2",
      currency: "EUR",
      createdAt: "2026-06-13T00:00:00.000Z",
      members: joined.members,
    });
  });

  it("imports snake_case members using the group id fallback", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;

    await importJoinedGroup(db, {
      id: "group-joined",
      name: "Weekend trip",
      joinCode: "ABCD2",
      currency: "EUR",
      createdAt: "2026-06-13T00:00:00.000Z",
      member: {
        id: "member-bob",
        group_id: "group-joined",
        display_name: "Bob",
      } as unknown as JoinGroupResult["member"],
      members: [
        {
          id: "member-alice",
          group_id: "group-joined",
          display_name: "Alice",
        },
        {
          id: "member-bob",
          group_id: "group-joined",
          display_name: "Bob",
        },
      ] as unknown as JoinGroupResult["members"],
    });

    const loaded = await getGroup(db, "group-joined");
    expect(loaded?.members.map((member) => member.displayName).sort()).toEqual([
      "Alice",
      "Bob",
    ]);
  });

  it("merges members when the group already exists locally", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;

    const existing = await createGroup(db, {
      name: "Weekend trip",
      currency: "EUR",
      memberNames: ["Alice"],
    });

    await importJoinedGroup(db, {
      ...existing,
      member: {
        id: "member-bob",
        groupId: existing.id,
        displayName: "Bob",
      },
      members: [
        ...existing.members,
        {
          id: "member-bob",
          groupId: existing.id,
          displayName: "Bob",
        },
      ],
    });

    const loaded = await getGroup(db, existing.id);
    expect(loaded?.members.map((member) => member.displayName).sort()).toEqual([
      "Alice",
      "Bob",
    ]);
  });
});
