
export type AssetType = 'Agent' | 'Prompt' | 'Tool' | 'Workflow' | 'Plugin' | 'EvaluationSuite' | 'Dataset' | 'KnowledgePack';

export type AssetLifecycleStatus = 'Draft' | 'Validation' | 'Evaluation' | 'GovernanceReview' | 'Approved' | 'Production' | 'Deprecated' | 'Archived';

export interface VersionInfo {
  semanticVersion: string; // e.g., '2.3.1'
  revisionId: string;      // Immutable content hash e.g., 'sha256:9af3...'
}

export interface MarketplaceAsset {
  id: string;
  type: AssetType;
  name: string;
  description: string;
  owner: string;
  version: VersionInfo;
  status: AssetLifecycleStatus;
  dependencies: string[]; // List of other asset IDs
  manifest: any; // The actual content/definition
}
