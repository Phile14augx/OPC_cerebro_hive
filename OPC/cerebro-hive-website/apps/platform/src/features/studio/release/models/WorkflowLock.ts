
export interface ProvenanceSignature {
  actor: string;
  role: string;
  signature: string;
  approvalReason?: string;
  timestamp: string;
}

export interface SupplyChainProvenance {
  buildMachine: string;
  sourceCommit: string;
  sbom: string;
  signatures: ProvenanceSignature[];
}

export interface WorkflowLock {
  compilerVersion: string;
  schemaVersion: string;
  runtimeVersion: string;
  pluginVersions: Record<string, string>;
  modelVersions: Record<string, string>;
  featureFlags: Record<string, boolean>;
  environmentHash: string;
  resourceLimits: Record<string, string>;
  contentHash: string; // The canonical AST hash
  buildTimestamp: string;
  provenance: SupplyChainProvenance;
}
