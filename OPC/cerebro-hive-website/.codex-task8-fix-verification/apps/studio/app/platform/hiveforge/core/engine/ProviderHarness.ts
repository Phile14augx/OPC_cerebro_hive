import { ProviderContract } from "../contracts/provider";

export interface ConformanceResult {
  passed: boolean;
  score: number;
  checks: { name: string; passed: boolean; error?: string }[];
}

export class ProviderTestHarness {
  
  async testProvider(provider: ProviderContract): Promise<ConformanceResult> {
    const checks: { name: string; passed: boolean; error?: string }[] = [];
    let passedChecks = 0;

    const runCheck = async (name: string, fn: () => Promise<void> | void) => {
      try {
        await fn();
        checks.push({ name, passed: true });
        passedChecks++;
      } catch (err: any) {
        checks.push({ name, passed: false, error: err.message });
      }
    };

    // 1. Identity Check
    await runCheck("Identity metadata must be valid", () => {
      if (!provider.identity.id || !provider.identity.vendor) throw new Error("Missing ID or Vendor");
    });

    // 2. Capability Hierarchy Check
    await runCheck("Capabilities must be structured hierarchically", () => {
      if (!provider.capabilities) throw new Error("Missing capabilities");
      if (typeof provider.capabilities !== "object") throw new Error("Capabilities must be an object tree");
    });

    // 3. Regions Validation
    await runCheck("Regions must declare Availability Zones and Latency", () => {
      if (!provider.regions || provider.regions.length === 0) throw new Error("Must support at least 1 region");
      const r = provider.regions[0];
      if (!r.availabilityZones || !r.latencyTier) throw new Error("Missing region metadata");
    });

    // 4. Runtime Health Check
    await runCheck("Runtime must support health reporting", () => {
      if (!["Healthy", "Warning", "Critical", "Unknown"].includes(provider.runtime.health)) {
        throw new Error("Invalid health state");
      }
    });

    const passed = passedChecks === checks.length;
    const score = Math.round((passedChecks / checks.length) * 100);

    return {
      passed,
      score,
      checks
    };
  }
}

export const providerHarness = new ProviderTestHarness();
