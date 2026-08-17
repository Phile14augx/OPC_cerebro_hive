import { describe, expect, it } from "vitest";

import { LocalExecutionProvider } from "./local-provider.js";

describe("LocalExecutionProvider", () => {
  it("reports its lack of sandbox runtimes", () => {
    const provider = new LocalExecutionProvider({ workRoot: ".tmp", acknowledgeNoIsolation: true });
    expect(provider.capabilities()).toMatchObject({
      supportsArrayJobs: false,
      supportsGpu: false,
      sandboxRuntimes: [],
    });
  });
});
