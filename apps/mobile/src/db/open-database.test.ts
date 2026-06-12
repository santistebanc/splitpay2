import { PowerSyncDatabase } from "@powersync/node";
import { afterEach, describe, expect, it } from "vitest";

import { AppSchema } from "./schema.js";
import type { AppTableName } from "./table-names.js";
import { APP_TABLE_NAMES } from "./table-names.js";

async function countRows(
  db: PowerSyncDatabase,
  table: AppTableName
): Promise<number> {
  const rows = await db.getAll<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table}`
  );
  return rows[0]?.count ?? 0;
}

describe("local database", () => {
  let db: PowerSyncDatabase | undefined;

  afterEach(async () => {
    if (db) {
      await db.close();
      db = undefined;
    }
  });

  it("creates empty tables for the splitpay schema", async () => {
    db = new PowerSyncDatabase({
      schema: AppSchema,
      database: { dbFilename: `splitpay-test-${crypto.randomUUID()}.db` },
    });
    await db.init();

    for (const table of APP_TABLE_NAMES) {
      await expect(countRows(db, table)).resolves.toBe(0);
    }
  });
});
