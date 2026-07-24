export interface RiskAssessment {
  baseScore: number;
  factors: string[];
}

export interface RiskProvider {
  evaluateRisk(changeRequestId: string, payload: any): Promise<RiskAssessment>;
}

export class MockRiskProvider implements RiskProvider {
  async evaluateRisk(changeRequestId: string, payload: any): Promise<RiskAssessment> {
    return {
      baseScore: 45,
      factors: ['MissionCritical Asset', '2 Dependencies']
    };
  }
}
