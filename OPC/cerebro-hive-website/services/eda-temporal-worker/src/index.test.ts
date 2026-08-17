import { describe, expect, it } from "vitest";

import { EDA_TEMPORAL_WORKER_VERSION } from "./index";

describe("EDA temporal worker package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_TEMPORAL_WORKER_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
