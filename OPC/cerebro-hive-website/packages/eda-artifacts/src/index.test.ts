import { describe, expect, it } from "vitest";

import { EDA_ARTIFACTS_VERSION } from "./index";

describe("EDA artifacts package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_ARTIFACTS_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
