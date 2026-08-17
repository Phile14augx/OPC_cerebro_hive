import { describe, expect, it } from "vitest";

import { EDA_OBSERVABILITY_VERSION } from "./index";

describe("EDA observability package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_OBSERVABILITY_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
