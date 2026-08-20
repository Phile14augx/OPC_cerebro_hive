export interface ResilienceAssessment {
  violatesRTO: boolean;
  message: string;
}

export interface ResilienceProvider {
  validateRecoveryObjectives(ciIds: string[]): Promise<ResilienceAssessment>;
}

export class MockResilienceProvider implements ResilienceProvider {
  async validateRecoveryObjectives(_ciIds: string[]): Promise<ResilienceAssessment> {
    return { violatesRTO: false, message: 'All dependencies meet required RTO' };
  }
}
