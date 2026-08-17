import { describe, expect, it } from "vitest";

import { EDA_SECURITY_VERSION } from "./index";

describe("EDA security package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_SECURITY_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
