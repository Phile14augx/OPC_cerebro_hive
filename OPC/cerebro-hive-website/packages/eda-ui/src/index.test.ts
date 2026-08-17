import { describe, expect, it } from "vitest";

import { EDA_UI_VERSION } from "./index";

describe("EDA UI package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_UI_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
