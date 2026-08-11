import { defineConfig } from "vitest/config";
export default defineConfig({
  css: { postcss: {} }, // stop vite walking up to the website's postcss config
  test: { include: ["test/**/*.test.ts", "src/**/*.test.ts"], environment: "node", testTimeout: 15000 },
});
