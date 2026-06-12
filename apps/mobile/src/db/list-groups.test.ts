import { PowerSyncDatabase } from "@powersync/node";
import { afterEach, describe, expect, it } from "vitest";

import { createGroup } from "./create-group.js";
import { listGroups } from "./list-groups.js";
import { AppSchema } from "./schema.js";

async function openTestDatabase(): Promise<PowerSyncDatabase> {
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: { dbFilename: `splitpay-test-${crypto.randomUUID()}.db` },
  });
  await db.init();
  return db;
}

describe("listGroups", () => {
  let db: PowerSyncDatabase | undefined;

  afterEach(async () => {
    if (db) {
      await db.close();
      db = undefined;
    }
  });

  it("returns groups newest first", async () => {
    db = await openTestDatabase();
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
