import { describe, expect, it } from "vitest";

import { EDA_API_VERSION } from "./index";

describe("EDA API package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_API_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
