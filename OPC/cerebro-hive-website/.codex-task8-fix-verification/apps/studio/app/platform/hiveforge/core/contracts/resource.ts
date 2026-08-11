/**
 * Universal Resource Descriptor (URD)
 * Every managed object exposes a common descriptor.
 */
export interface URD {
  id: string;
  kind: string; // e.g., 'database', 'vm', 'bucket'
  type: string; // e.g., 'postgres', 'ubuntu', 's3'
  provider: string; // e.g., 'aws', 'azure', 'local'
  
  // Workspace hierarchy
  organizationId: string;
  workspaceId: string;
  projectId: string;
  environmentId: string;
  
  labels: Record<string, string>;
  owner: string;
  permissions: Record<string, string[]>;
  
  metadata: Record<string, unknown>;
  
  status: "pending" | "provisioning" | "running" | "stopped" | "failed" | "terminated";
  health: "healthy" | "degraded" | "unhealthy" | "unknown";
  
  cost?: {
    hourlyUsd: number;
    monthlyUsd: number;
  };
  
  // Graph Relationships
  relationships: {
    dependsOn: string[]; // URD IDs
    dependencyOf: string[];
  };
}

export interface ResourceProvider {
  provision(urd: URD): Promise<URD>;
  terminate(urd: URD): Promise<void>;
  getStatus(urd: URD): Promise<URD>;
}
