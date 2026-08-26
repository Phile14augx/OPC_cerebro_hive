export interface RiskAssessment {
  baseScore: number;
  factors: string[];
}

export interface RiskProvider {
  evaluateRisk(changeRequestId: string, payload: unknown): Promise<RiskAssessment>;
}

export class MockRiskProvider implements RiskProvider {
  async evaluateRisk(_changeRequestId: string, _payload: unknown): Promise<RiskAssessment> {
    return {
      baseScore: 45,
      factors: ['MissionCritical Asset', '2 Dependencies']
    };
  }
}
