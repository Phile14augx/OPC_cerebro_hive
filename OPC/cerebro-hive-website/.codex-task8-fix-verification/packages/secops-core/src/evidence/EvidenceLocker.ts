import { createHash } from 'crypto';

export interface EvidenceArtifact {
  id: string;
  caseId: string;
  source: string; // e.g., 'IntelligenceCore', 'IdentityOS'
  type: 'TimelineSnapshot' | 'RiskSnapshot' | 'SessionSnapshot' | 'ThreatAlert';
  payload: any;
  collectedAt: Date;
  checksum: string;
}

export class EvidenceLocker {
  private artifacts = new Map<string, EvidenceArtifact>();

  /**
   * Seals a payload into an immutable Evidence Artifact.
   */
  async storeEvidence(caseId: string, source: string, type: EvidenceArtifact['type'], payload: any): Promise<EvidenceArtifact> {
    const payloadStr = JSON.stringify(payload);
    const checksum = createHash('sha256').update(payloadStr).digest('hex');

    const artifact: EvidenceArtifact = {
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      caseId,
      source,
      type,
      payload,
      collectedAt: new Date(),
      checksum
    };

    this.artifacts.set(artifact.id, artifact);
    console.log(`[EvidenceLocker] 🔒 Stored immutable evidence ${artifact.id} (Checksum: ${checksum.substring(0, 8)}...)`);
    return artifact;
  }

  async getEvidenceForCase(caseId: string): Promise<EvidenceArtifact[]> {
    return Array.from(this.artifacts.values()).filter(a => a.caseId === caseId);
  }

  /**
   * Verifies the integrity of an artifact.
   */
  verifyIntegrity(artifactId: string): boolean {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) return false;

    const payloadStr = JSON.stringify(artifact.payload);
    const calculatedChecksum = createHash('sha256').update(payloadStr).digest('hex');
    
    return calculatedChecksum === artifact.checksum;
  }
}
