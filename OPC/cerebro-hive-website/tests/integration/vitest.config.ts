import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run each test file in isolation — important for DB fixture cleanup
    pool:           "forks",
    poolOptions:    { forks: { singleFork: false } },

    // Long timeout for network-dependent tests
    testTimeout:    30_000,
    hookTimeout:    20_000,

    // Integration tests must be explicit — no accidental unit test discovery
    include:        ["**/*.test.ts"],
    exclude:        ["**/node_modules/**"],

    // Environment variables with fallbacks (can be overridden by .env.test)
    env: {
      PLATFORM_API_URL: process.env["PLATFORM_API_URL"] ?? "http://localhost:4000",
      FORGE_API_URL:    process.env["FORGE_API_URL"]    ?? "http://localhost:4001",
      NATS_URL:         process.env["NATS_URL"]         ?? "nats://localhost:4222",
      TEST_JWT_SECRET:  process.env["TEST_JWT_SECRET"]  ?? "test-secret-32-chars-minimum!!",
    },

    // Show verbose output for CI
    reporter: process.env["CI"] ? ["verbose", "junit"] : ["verbose"],
    outputFile: {
      junit: "./test-results/integration.xml",
    },

    // Global setup file
    setupFiles: ["./setup.ts"],

    // Retry flaky network tests once
    retry: 1,

    // Sequence: run suites serially to avoid DB conflicts across files
    sequence: {
      concurrent: false,
    },
  },
});
