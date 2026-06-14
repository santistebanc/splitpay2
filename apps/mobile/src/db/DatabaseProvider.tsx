import type { AbstractPowerSyncDatabase } from "@powersync/common";
import { PowerSyncContext, usePowerSync } from "@powersync/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  AppState,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "react-native-paper";

import { initAppDatabase } from "./app-database";
import {
  connectSyncIfConfigured,
  reconnectSyncIfConfigured,
} from "./connect-sync";
import { isSyncConfigured } from "./sync-config";

type DatabaseProviderProps = {
  children: ReactNode;
};

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [db, setDb] = useState<AbstractPowerSyncDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void initAppDatabase()
      .then((database) => {
        setDb(database);
        void connectSyncIfConfigured(database).catch(() => {
          // Stay offline when sync is unavailable.
        });
      })
      .catch((cause: unknown) => {
        const message =
          cause instanceof Error ? cause.message : "Database failed to open";
        setError(message);
      });
  }, []);

  useEffect(() => {
    if (!db || !isSyncConfigured() || Platform.OS === "web") {
      return;
    }

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void reconnectSyncIfConfigured(db);
      }
    });

    const disposeSync = db.registerListener({
      statusChanged: (status) => {
        if (status.dataFlowStatus.downloadError) {
          void reconnectSyncIfConfigured(db);
        }
      },
    });

    return () => {
      subscription.remove();
      disposeSync();
    };
  }, [db]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">Database error: {error}</Text>
      </View>
    );
  }

  if (!db) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading database…
        </Text>
      </View>
    );
  }

  return (
    <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>
  );
}

export function useDatabase(): AbstractPowerSyncDatabase {
  return usePowerSync();
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    marginTop: 8,
  },
});
