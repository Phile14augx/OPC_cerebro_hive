import { RecommendationRepository } from './Repository';
export class RecommendationService {
  constructor(private repo: RecommendationRepository) {}
  async fetchRecommendations() { return this.repo.getRecommendations(); }
}
export const recommendationService = new RecommendationService(new RecommendationRepository());