import type { AbstractPowerSyncDatabase } from "@powersync/common";
import { SQLJSOpenFactory } from "@powersync/adapter-sql-js";
import { PowerSyncDatabase } from "@powersync/react-native";

import { isE2eSeedName, runE2eSeed } from "./e2e-seed";
import { listGroups } from "./list-groups";
import { AppSchema } from "./schema";

const DB_FILENAME = "splitpay.db";

let dbPromise: Promise<AbstractPowerSyncDatabase> | undefined;

function getE2eSeedFromUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("e2eSeed");
}

/** Opens the app SQLite database and applies optional e2e seed data. */
export async function initAppDatabase(): Promise<AbstractPowerSyncDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = new PowerSyncDatabase({
        schema: AppSchema,
        database: new SQLJSOpenFactory({ dbFilename: DB_FILENAME }),
      });
      await db.init();

      const seedName = getE2eSeedFromUrl();
      if (seedName && isE2eSeedName(seedName)) {
        const groups = await listGroups(db);
        if (groups.length === 0) {
          await runE2eSeed(db, seedName);
        }
      }

      return db;
    })();
  }

  return dbPromise;
}
