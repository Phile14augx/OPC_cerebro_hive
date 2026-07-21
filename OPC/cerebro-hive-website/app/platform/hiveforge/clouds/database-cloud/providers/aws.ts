import { ProviderContract, ProviderIdentity, ProviderCapabilities, ProviderRegion, ProviderLimits, ProviderRuntime } from "../../../core/contracts/provider";

export class MockAWSProvider implements ProviderContract {
  identity: ProviderIdentity = {
    id: "aws.rds",
    vendor: "AWS",
    version: "1.0.0",
    apiVersion: "2023-01-01"
  };

  capabilities: ProviderCapabilities = {
    databases: {
      id: "cap.db",
      name: "Databases",
      enabled: true,
      children: [
        { id: "databases.relational", name: "Relational", enabled: true },
        { id: "databases.backups", name: "Backups", enabled: true, children: [
          { id: "databases.backups.pitr", name: "Point-in-Time Recovery", enabled: true }
        ]}
      ]
    }
  };

  regions: ProviderRegion[] = [
    { id: "us-east-1", name: "N. Virginia", availabilityZones: ["a", "b", "c"], latencyTier: "low" },
    { id: "eu-west-1", name: "Ireland", availabilityZones: ["a", "b", "c"], latencyTier: "medium" }
  ];

  limits: ProviderLimits = {
    quotas: { "max_clusters": 50 },
    instanceLimits: { "max_vcpus": 1000 },
    storageLimits: { "max_tb": "500" },
    apiRateLimits: { "requests_per_sec": "100" }
  };

  runtime: ProviderRuntime = {
    health: "Healthy",
    authentication: "iam",
    provisioningEndpoint: "https://rds.amazonaws.com"
  };

  validateCapability(path: string): boolean {
    // Mock check: e.g. "databases.backups.pitr"
    // Just returns true for demo if it starts with databases.
    return path.startsWith("databases"); 
  }

  async estimateCost(blueprintId: string, spec: unknown): Promise<{ currency: string; amount: number }> {
    return { currency: "USD", amount: 150 };
  }
}
