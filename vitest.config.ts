import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["*.test.ts", "packages/**/*.test.ts", "apps/**/*.test.ts"],
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
