import { describe, expect, it } from "vitest";

import { EDA_COVERAGE_VERSION } from "./index";

describe("EDA coverage package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_COVERAGE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
