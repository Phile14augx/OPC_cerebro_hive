import { describe, expect, it } from "vitest";

import { DEFAULT_PARSER_LIMITS } from "./parser-provider.js";

describe("DEFAULT_PARSER_LIMITS", () => {
  it("bounds parser fact size and wall-clock execution", () => {
    expect(DEFAULT_PARSER_LIMITS.maxFactBytes).toBeGreaterThan(0);
    expect(DEFAULT_PARSER_LIMITS.wallclockSec).toBeGreaterThan(0);
  });
});
