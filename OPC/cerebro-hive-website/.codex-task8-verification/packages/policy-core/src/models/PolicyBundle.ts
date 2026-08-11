export interface PolicyReference {
  policyId: string;
  versionConstraint: string; // e.g., '^1.0.0' or 'exact 2.1.0'
}

export interface PolicyManifest {
  name: string;
  description: string;
  policies: PolicyReference[];
  dependencies?: string[]; // Other bundle IDs this bundle depends on
}

export interface PolicyBundle {
  id: string;
  version: string; // Immutable version of the bundle itself
  manifest: PolicyManifest;
  signature: string; // Cryptographic signature ensuring integrity
  compiledAt: Date;
  compiledBy: string;
}
