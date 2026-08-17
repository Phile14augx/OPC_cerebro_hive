import { describe, expect, it } from "vitest";

import { EDA_EXECUTION_WORKER_VERSION } from "./index";

describe("EDA execution worker package contract", () => {
  it("exports a semantic version identifier", () => {
    expect(EDA_EXECUTION_WORKER_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
