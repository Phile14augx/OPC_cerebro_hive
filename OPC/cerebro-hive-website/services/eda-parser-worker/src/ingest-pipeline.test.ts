import { describe, expect, it } from "vitest";

import { compareRuns } from "./ingest-pipeline.js";

describe("compareRuns", () => {
  it("separates new and resolved findings by stable signature", () => {
    const before = {
      runId: "before",
      jobId: "job" as never,
      toolExitCode: 0,
      infrastructureFailure: null,
      collisions: 0,
      findings: [
        {
          signature: "sig:timing.v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as never,
          factType: "timing.path",
          payload: {},
          semanticKey: [],
          sourceRef: {},
          runId: "before",
        },
      ],
    };
    const after = {
      runId: "after",
      jobId: "job" as never,
      toolExitCode: 0,
      infrastructureFailure: null,
      collisions: 0,
      findings: [
        {
          signature: "sig:timing.v1:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as never,
          factType: "timing.path",
          payload: {},
          semanticKey: [],
          sourceRef: {},
          runId: "after",
        },
      ],
    };

    const result = compareRuns(before, after);
    expect(result.newFindings).toHaveLength(1);
    expect(result.resolved).toHaveLength(1);
    expect(result.persisting).toHaveLength(0);
  });
});
