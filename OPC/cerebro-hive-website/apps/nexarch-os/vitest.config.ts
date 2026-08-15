import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      NEXARCH_OS_DB: ":memory:",
      VITEST: "true",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
