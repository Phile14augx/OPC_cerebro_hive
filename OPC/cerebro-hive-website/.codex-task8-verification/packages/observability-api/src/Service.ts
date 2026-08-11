import { ObservabilityRepository } from './Repository';
export class ObservabilityService {
  constructor(private repo: ObservabilityRepository) {}
  async fetchRecentTraces() { return this.repo.getRecentTraces(); }
}
export const observabilityService = new ObservabilityService(new ObservabilityRepository());