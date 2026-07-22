export class SkillGraphService {
  async recordEvidence(candidateId: string, capabilityId: string, evidence: any): Promise<void> {
    console.log(`Mock recording evidence for ${candidateId}, capability ${capabilityId}`, evidence);
  }
}

export const skillGraphService = new SkillGraphService();
