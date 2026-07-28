
export interface ReviewProvenance {
  readonly reviewEngineVersion: string;
  readonly generatedAt: Date;
  readonly snapshotId: string;
  readonly orchestratorVersion: string;
  readonly contributorManifestHash: string;
  readonly manifestHash: string;
}
