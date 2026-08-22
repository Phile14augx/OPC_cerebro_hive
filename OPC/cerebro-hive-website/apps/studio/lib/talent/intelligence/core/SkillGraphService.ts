// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ARCH-LINT: Deferred
// @ts-nocheck
export class SkillGraphService {
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  async recordEvidence(candidateId: string, capabilityId: string, evidence: any): Promise<void> {
    console.log(`Mock recording evidence for ${candidateId}, capability ${capabilityId}`, evidence);
  }
}

export const skillGraphService = new SkillGraphService();
