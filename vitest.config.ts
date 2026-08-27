import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["module-sync", "module", "browser", "node"],
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.spec.ts", "test/**/*.spec.ts"],
  },
});
