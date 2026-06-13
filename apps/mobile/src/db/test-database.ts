import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PowerSyncDatabase } from "@powersync/node";

import { AppSchema } from "./schema";

export type TestDatabase = {
  db: PowerSyncDatabase;
  dbPath: string;
};

/** Opens an isolated PowerSync database under the system temp directory. */
export async function openTestDatabase(
  prefix = "splitpay-test"
): Promise<TestDatabase> {
  const dbPath = join(tmpdir(), `${prefix}-${randomUUID()}.db`);
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: { dbFilename: dbPath },
  });
  await db.init();

  return { db, dbPath };
}

/** Closes a test database and removes its SQLite files. */
export async function closeTestDatabase(
  db: PowerSyncDatabase,
  dbPath: string
): Promise<void> {
  await db.disconnect().catch(() => undefined);
  await db.close();
  await rm(dbPath, { force: true });
  await rm(`${dbPath}-shm`, { force: true });
  await rm(`${dbPath}-wal`, { force: true });
}
