import { Recommendation } from './Types';
export class RecommendationRepository {
  async getRecommendations(): Promise<Recommendation[]> {
    return [{ id: '1', title: 'Scale down GPT-4 Router', impact: 'High Cost Savings' }];
  }
}