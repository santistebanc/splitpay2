import { afterEach, describe, expect, it } from "vitest";

import type { AppTableName } from "./table-names.js";
import { APP_TABLE_NAMES } from "./table-names.js";
import {
  closeTestDatabase,
  openTestDatabase,
  type TestDatabase,
} from "./test-database.js";

async function countRows(
  testDb: TestDatabase,
  table: AppTableName
): Promise<number> {
  const rows = await testDb.db.getAll<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table}`
  );
  return rows[0]?.count ?? 0;
}

describe("local database", () => {
  let testDb: TestDatabase | undefined;

  afterEach(async () => {
    if (testDb) {
      await closeTestDatabase(testDb.db, testDb.dbPath);
      testDb = undefined;
    }
  });

  it("creates empty tables for the splitpay schema", async () => {
    testDb = await openTestDatabase();

    for (const table of APP_TABLE_NAMES) {
      await expect(countRows(testDb, table)).resolves.toBe(0);
    }
  });
});
