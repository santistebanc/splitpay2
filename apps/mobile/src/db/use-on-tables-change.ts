import type { AbstractPowerSyncDatabase } from "@powersync/common";
import { useEffect } from "react";

import type { AppTableName } from "./table-names";

/** Re-runs `onChange` when PowerSync applies local writes or synced server rows. */
export function useOnTablesChange(
  db: AbstractPowerSyncDatabase,
  tables: readonly AppTableName[],
  onChange: () => void
): void {
  const tableKey = tables.join(",");

  useEffect(() => {
    const dispose = db.onChangeWithCallback(
      {
        onChange: () => {
          onChange();
        },
      },
      { tables: [...tables] }
    );

    return () => dispose();
  }, [db, onChange, tableKey]);
}
