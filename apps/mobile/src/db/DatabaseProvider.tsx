import type { AbstractPowerSyncDatabase } from "@powersync/common";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Text } from "react-native-paper";

import { initAppDatabase } from "./app-database";
import { connectSyncIfConfigured } from "./connect-sync";

const DatabaseContext = createContext<AbstractPowerSyncDatabase | null>(null);

type DatabaseProviderProps = {
  children: ReactNode;
};

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [db, setDb] = useState<AbstractPowerSyncDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void initAppDatabase()
      .then(async (database) => {
        try {
          await connectSyncIfConfigured(database);
        } catch {
          // Stay offline when sync is unavailable.
        }
        setDb(database);
      })
      .catch((cause: unknown) => {
        const message =
          cause instanceof Error ? cause.message : "Database failed to open";
        setError(message);
      });
  }, []);

  if (error) {
    return <Text variant="bodyMedium">Database error: {error}</Text>;
  }

  if (!db) {
    return <Text variant="bodyMedium">Loading database…</Text>;
  }

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
}

export function useDatabase(): AbstractPowerSyncDatabase {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error("Database is not ready");
  }

  return db;
}
