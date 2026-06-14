import type { SQLJSPersister } from "@powersync/adapter-sql-js";
import * as FileSystem from "expo-file-system/legacy";

/** Persists the SQL.js database to app storage (required for Expo Go on device). */
export function createSQLJSPersister(dbFilename: string): SQLJSPersister {
  const dbPath = `${FileSystem.documentDirectory}${dbFilename}`;

  return {
    readFile: async (): Promise<ArrayLike<number> | Buffer | null> => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        if (!fileInfo.exists) {
          return null;
        }

        const base64 = await FileSystem.readAsStringAsync(dbPath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      } catch {
        return null;
      }
    },

    writeFile: async (data: ArrayLike<number> | Buffer): Promise<void> => {
      const uint8Array = new Uint8Array(data);
      const binary = Array.from(uint8Array, (byte) =>
        String.fromCharCode(byte)
      ).join("");
      const base64 = btoa(binary);

      await FileSystem.writeAsStringAsync(dbPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    },
  };
}
