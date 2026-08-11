import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["app/dashboard/cerebrosphere/**/*.test.ts", "app/dashboard/cerebrosphere/**/*.test.tsx"],
    setupFiles: ["./test/setup.ts"],
  },
});
