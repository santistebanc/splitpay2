import { afterEach, describe, expect, it } from "vitest";

import { createGroup, getGroup } from "./create-group.js";
import {
  closeTestDatabase,
  openTestDatabase,
  type TestDatabase,
} from "./test-database.js";

describe("createGroup", () => {
  let testDb: TestDatabase | undefined;

  afterEach(async () => {
    if (testDb) {
      await closeTestDatabase(testDb.db, testDb.dbPath);
      testDb = undefined;
    }
  });

  it("persists a group with initial members and reads it back", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;

    const created = await createGroup(db, {
      name: "Ski weekend",
      currency: "EUR",
      memberNames: ["Alice", "Bob"],
    });

    expect(created.name).toBe("Ski weekend");
    expect(created.currency).toBe("EUR");
    expect(created.members).toEqual([
      expect.objectContaining({ displayName: "Alice" }),
      expect.objectContaining({ displayName: "Bob" }),
    ]);
    expect(created.joinCode).toMatch(/^[A-Z2-9]{5}$/);
    expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const loaded = await getGroup(db, created.id);
    expect(loaded).toEqual(created);
  });

  it("returns null when the group id is unknown", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;

    await expect(getGroup(db, "missing-group")).resolves.toBeNull();
  });
});
