import { describe, expect, it } from "vitest";

import type { ProviderContract } from "../contracts/provider";
import { ProviderTestHarness } from "./ProviderHarness";

function createConformantProvider(): ProviderContract {
  return {
    identity: {
      id: "provider.test",
      vendor: "Test Vendor",
      version: "1.0.0",
      apiVersion: "1.0",
    },
    capabilities: {
      compute: { id: "compute", name: "Compute", enabled: true },
    },
    regions: [{ id: "test-1", name: "Test Region", availabilityZones: ["test-1a"], latencyTier: "low" }],
    limits: {
      quotas: {},
      instanceLimits: {},
      storageLimits: {},
      apiRateLimits: {},
    },
    runtime: {
      health: "Healthy",
      authentication: "none",
      provisioningEndpoint: "https://provider.invalid",
    },
    validateCapability: () => true,
    estimateCost: async () => ({ currency: "USD", amount: 0 }),
  };
}

describe("ProviderTestHarness", () => {
  it("passes a conformant provider", async () => {
    const result = await new ProviderTestHarness().testProvider(createConformantProvider());

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.checks).toHaveLength(4);
  });

  it("normalizes a non-Error thrown value into a useful failure message", async () => {
    const provider = createConformantProvider();
    Object.defineProperty(provider, "capabilities", {
      get() {
        throw "capabilities unavailable";
      },
    });

    const result = await new ProviderTestHarness().testProvider(provider);

    expect(result.passed).toBe(false);
    expect(result.checks[1]).toEqual({
      name: "Capabilities must be structured hierarchically",
      passed: false,
      error: "capabilities unavailable",
    });
  });
});
