import { IProvisioningProvider, ProviderMetrics } from "../contracts/provider";
import { Plugin } from "../contracts/plugin";

export class MockCloudProvider implements IProvisioningProvider {
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  async create(resourceId: string, type: string, config: any): Promise<any> {
    console.log(`[MockCloudProvider] Creating ${type} resource ${resourceId}...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
    return { status: "running", internalId: `mock-id-${Date.now()}` };
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  async update(resourceId: string, type: string, config: any): Promise<any> {
    console.log(`[MockCloudProvider] Updating ${type} resource ${resourceId}...`);
    return { status: "updated" };
  }

  async delete(resourceId: string, type: string): Promise<void> {
    console.log(`[MockCloudProvider] Deleting ${type} resource ${resourceId}...`);
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ARCH-LINT: Deferred
  async metrics(resourceId: string): Promise<ProviderMetrics> {
    return {
      cpuUsagePercent: Math.random() * 100,
      memoryUsageBytes: 1024 * 1024 * 512,
    };
  }
}

export const mockCloudProviderPlugin: Plugin = {
  state: "ready",
  health: "Healthy",
  register: async () => {},
  provider: new MockCloudProvider(),
  manifest: {
    schemaVersion: "1.0",
    apiVersion: "1.0",
    metadata: { id: "mock-aws", name: "Mock AWS Provider", version: "1.0.0" },
    kind: "provider",
    spec: {
      description: "Mock provider for end-to-end testing",
      categories: ["compute"]
    }
  }
};
