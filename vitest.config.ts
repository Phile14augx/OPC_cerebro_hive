import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["module-sync", "module", "browser", "node"],
  },
  test: { exclude: ['dist/**', 'OPC/**', 'node_modules/**'],
    environment: "node",
    globals: true,
    include: ["src/**/*.spec.ts", "test/**/*.spec.ts"],
  },
});

