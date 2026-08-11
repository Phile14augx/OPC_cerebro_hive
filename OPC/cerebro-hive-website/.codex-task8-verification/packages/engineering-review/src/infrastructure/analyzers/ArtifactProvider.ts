import { ArtifactReference } from './models';

/**
 * Storage-agnostic artifact provisioning.
 * The provider is responsible for authorization, caching, integrity validation,
 * checksums, decompression, mounting, and cleanup.
 */
export interface IArtifactProvider {
  /**
   * Prepares the artifact for analyzer consumption.
   * Depending on the ArtifactReference accessMode ('stream', 'mount', 'download'),
   * this will resolve to an accessible path, a stream, or a mounted volume.
   */
  provisionArtifact(ref: ArtifactReference): Promise<ProvisionedArtifact>;

  /**
   * Cleans up temporary mounts/downloads associated with an execution.
   */
  cleanup(executionId: string): Promise<void>;
}

export interface ProvisionedArtifact {
  readonly artifactId: string;
  readonly localPath?: string;
  readonly streamUrl?: string;
  readonly isMounted: boolean;
}
