import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // PowerSync + better-sqlite3 workers conflict when DB test files run in parallel.
    fileParallelism: false,
    include: [
      "*.test.ts",
      "env/**/*.test.ts",
      "packages/**/*.test.ts",
      "apps/**/*.test.ts",
    ],
    server: {
      deps: {
        inline: [/^@powersync\//],
      },
    },
  },
  ssr: {
    noExternal: [/^@powersync\//, "better-sqlite3"],
  },
});
