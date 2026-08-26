import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["app/dashboard/**/*.test.ts", "app/dashboard/**/*.test.tsx"],
    setupFiles: ["./test/setup.ts"],
  },
});
