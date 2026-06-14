import { useFocusEffect } from "@react-navigation/native";
import { usePowerSync } from "@powersync/react";
import { useCallback } from "react";
import { Platform } from "react-native";

import { ensureSyncConnected } from "../connect-sync";
import { refreshGroupRosterFromServer } from "../join-group";
import { isSyncConfigured } from "../sync-config";

/** Ensures sync is connected and merges server roster when a screen gains focus. */
export function useSyncOnFocus(groupId?: string): void {
  const db = usePowerSync();

  useFocusEffect(
    useCallback(() => {
      if (!isSyncConfigured()) {
        return;
      }

      void (async () => {
        if (Platform.OS !== "web") {
          await ensureSyncConnected(db);
        }
        if (groupId) {
          await refreshGroupRosterFromServer(db, groupId);
        }
      })();
    }, [db, groupId])
  );
}
