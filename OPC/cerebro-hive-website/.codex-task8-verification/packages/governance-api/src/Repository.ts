import { PolicyEvaluation } from './Types';
export class GovernanceRepository {
  async getRecentEvaluations(): Promise<PolicyEvaluation[]> {
    return [{ id: '1', policy: 'Data Privacy', status: 'passed', timestamp: new Date() }, { id: '2', policy: 'Model Toxicity', status: 'failed', timestamp: new Date() }];
  }
}