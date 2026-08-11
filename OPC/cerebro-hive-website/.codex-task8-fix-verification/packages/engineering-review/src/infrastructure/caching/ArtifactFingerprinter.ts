import { ArtifactReference } from '../analyzers/models';
import { ArtifactFingerprint } from './models';

export interface IArtifactFingerprinter {
  fingerprint(artifact: ArtifactReference): Promise<ArtifactFingerprint>;
}

export class GitCommitFingerprinter implements IArtifactFingerprinter {
  async fingerprint(artifact: ArtifactReference): Promise<ArtifactFingerprint> {
    if (artifact.type !== 'repository') {
      throw new Error('GitCommitFingerprinter only supports repository artifacts');
    }
    
    return {
      algorithm: 'sha256',
      version: '1.0',
      digest: artifact.uri.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    };
  }
}
