import { describe, expect, it } from "vitest";

import { EDA_PORTAL_VERSION } from "./index";

describe("EDA portal package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_PORTAL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
