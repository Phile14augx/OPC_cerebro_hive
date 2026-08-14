import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.tsx", "apps/studio/tests/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
  },
});
