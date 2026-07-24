/**
 * Global integration test setup
 *
 * Loaded via vitest.config.ts `setupFiles`
 */

import { beforeAll, afterAll } from "vitest";

// Verify required env vars before any test runs
beforeAll(() => {
  const required = ["TEST_DATABASE_URL"];
  const missing  = required.filter(k => !process.env[k]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars for integration tests: ${missing.join(", ")}\n` +
      `Copy .env.test.example to .env.test and fill in values.`,
    );
  }
});

// Increase max listeners (EventSource + Prisma can trigger Node warnings)
if (typeof process !== "undefined") {
  process.setMaxListeners(50);
}

// Polyfill EventSource for Node.js (used by SSE tests)
// The `eventsource` package must be installed
if (typeof globalThis.EventSource === "undefined") {
  const { EventSource } = await import("eventsource").catch(() => ({ EventSource: undefined }));
  if (EventSource) {
    (globalThis as any).EventSource = EventSource;
  }
}
