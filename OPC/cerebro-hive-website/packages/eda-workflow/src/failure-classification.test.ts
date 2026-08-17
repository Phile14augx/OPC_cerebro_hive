import { describe, expect, it } from "vitest";

import { classify } from "./failure-classification.js";

describe("classify", () => {
  it("treats a non-zero tool exit as a completed domain outcome", () => {
    expect(
      classify(
        {
          kind: "outcome",
          exitCode: 2,
          usage: { cpuSeconds: 1, peakMemoryBytes: 0, wallclockSeconds: 1 },
        },
        1,
      ),
    ).toEqual({ action: "complete", outcome: "tool-rejected", exitCode: 2 });
  });
});
