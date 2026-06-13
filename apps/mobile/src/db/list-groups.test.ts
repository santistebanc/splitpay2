import { afterEach, describe, expect, it } from "vitest";

import { createGroup } from "./create-group.js";
import { listGroups } from "./list-groups.js";
import {
  closeTestDatabase,
  openTestDatabase,
  type TestDatabase,
} from "./test-database.js";

describe("listGroups", () => {
  let testDb: TestDatabase | undefined;

  afterEach(async () => {
    if (testDb) {
      await closeTestDatabase(testDb.db, testDb.dbPath);
      testDb = undefined;
    }
  });

  it("returns groups newest first", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;
    await createGroup(db, {
      name: "Ski weekend",
      currency: "EUR",
      memberNames: ["Alice"],
    });
    await createGroup(db, {
      name: "Beach trip",
      currency: "USD",
      memberNames: ["Bob"],
    });

    const groups = await listGroups(db);

    expect(groups.map((group) => group.name)).toEqual([
      "Beach trip",
      "Ski weekend",
    ]);
  });
});
