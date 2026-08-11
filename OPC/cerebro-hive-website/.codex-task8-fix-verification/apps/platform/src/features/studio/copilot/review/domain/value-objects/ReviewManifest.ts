
export interface ReviewManifest {
  readonly manifestId: string;
  readonly snapshotId: string;
  readonly policyVersion: string;
  readonly capabilityRegistryVersion: string;
  readonly contributorManifest: Record<string, string>; // e.g. { "SecurityContributor": "v4.0" }
  readonly platformVersion: string;
}
