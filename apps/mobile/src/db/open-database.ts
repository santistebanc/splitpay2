import { SQLJSOpenFactory } from "@powersync/adapter-sql-js";
import { PowerSyncDatabase } from "@powersync/react-native";

import { AppSchema } from "./schema";

export type OpenLocalDatabaseOptions = {
  dbFilename?: string;
};

/** Opens an offline PowerSync SQLite database (no connect/sync). */
export function openLocalDatabase(
  options: OpenLocalDatabaseOptions = {}
): PowerSyncDatabase {
  const dbFilename = options.dbFilename ?? `splitpay-${crypto.randomUUID()}.db`;

  return new PowerSyncDatabase({
    schema: AppSchema,
    database: new SQLJSOpenFactory({ dbFilename }),
  });
}

/** Waits for schema initialization; safe to call multiple times. */
export async function initLocalDatabase(
  db: PowerSyncDatabase
): Promise<PowerSyncDatabase> {
  await db.init();
  return db;
}
