import { describe, expect, it } from "vitest";

import { EDA_SDK_VERSION } from "./index";

describe("EDA SDK package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_SDK_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
