import type { AbstractPowerSyncDatabase } from "@powersync/common";
import { PowerSyncDatabase, WASQLiteOpenFactory } from "@powersync/web";

import { isE2eSeedName, runE2eSeed } from "./e2e-seed";
import { listGroups } from "./list-groups";
import { AppSchema } from "./schema";

const DB_FILENAME = "splitpay.db";

const WORKER_BASE = "/@powersync/worker";

let dbPromise: Promise<AbstractPowerSyncDatabase> | undefined;

function getE2eSeedFromUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("e2eSeed");
}

/** Opens the web SQLite database and applies optional e2e seed data. */
export async function initAppDatabase(): Promise<AbstractPowerSyncDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = new PowerSyncDatabase({
        schema: AppSchema,
        database: new WASQLiteOpenFactory({
          dbFilename: DB_FILENAME,
          worker: `${WORKER_BASE}/WASQLiteDB.umd.js`,
        }),
        flags: {
          disableSSRWarning: true,
        },
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
