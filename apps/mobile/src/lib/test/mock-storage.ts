import type { KeyValueStorage } from "../storage.js";

export function createMockStorage(
  initial: Record<string, string> = {}
): KeyValueStorage {
  const store = new Map(Object.entries(initial));

  return {
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
  };
}
