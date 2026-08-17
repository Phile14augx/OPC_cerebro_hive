import { describe, expect, it } from "vitest";

import { env } from "./env";

describe("archive API environment", () => {
  it("normalizes the configured port to a positive number", () => {
    expect(env.PORT).toBeTypeOf("number");
    expect(env.PORT).toBeGreaterThan(0);
  });
});
