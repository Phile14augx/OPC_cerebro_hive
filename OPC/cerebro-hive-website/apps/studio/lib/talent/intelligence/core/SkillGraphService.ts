export class SkillGraphService {
  async recordEvidence(candidateId: string, capabilityId: string, evidence: unknown): Promise<void> {
    if (!evidence || typeof evidence !== 'object') throw new TypeError('Evidence must be an object');
    const e = evidence as { score?: number; confidence?: number };
    if (typeof e.score !== 'number' || e.score < 0 || e.score > 100) throw new TypeError('Invalid score');
    if (typeof e.confidence !== 'number' || e.confidence < 0 || e.confidence > 1) throw new TypeError('Invalid confidence');
    console.log(`Mock recording evidence for ${candidateId}, capability ${capabilityId}`, evidence);
  }
}

export const skillGraphService = new SkillGraphService();
