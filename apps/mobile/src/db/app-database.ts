import { SQLJSOpenFactory } from "@powersync/adapter-sql-js";
import type { AbstractPowerSyncDatabase } from "@powersync/common";
import {
  PowerSyncDatabase,
  ReactNativeQuickSqliteOpenFactory,
} from "@powersync/react-native";

import { isExpoGo } from "./is-expo-go";
import { AppSchema } from "./schema";
import { createSQLJSPersister } from "./sql-js-persister";

const DB_FILENAME = "splitpay.db";

let dbPromise: Promise<AbstractPowerSyncDatabase> | undefined;

function createNativeDatabaseFactory() {
  if (isExpoGo()) {
    return new SQLJSOpenFactory({
      dbFilename: DB_FILENAME,
      persister: createSQLJSPersister(DB_FILENAME),
    });
  }

  return new ReactNativeQuickSqliteOpenFactory({
    dbFilename: DB_FILENAME,
  });
}

/** Opens the app SQLite database on native (dev build or Expo Go). */
export async function initAppDatabase(): Promise<AbstractPowerSyncDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = new PowerSyncDatabase({
        schema: AppSchema,
        database: createNativeDatabaseFactory(),
      });
      await db.init();
      return db;
    })();
  }

  return dbPromise;
}
