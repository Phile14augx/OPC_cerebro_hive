import { describe, expect, it } from "vitest";

import { EDA_RTL_INDEX_WORKER_VERSION } from "./index";

describe("EDA RTL index worker package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_RTL_INDEX_WORKER_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
