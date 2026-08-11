import { GovernanceRepository } from './Repository';
import { PlatformEventBus } from '@cerebro/events';
export class GovernanceService {
  constructor(private repo: GovernanceRepository) {}
  async fetchRecentEvaluations() {
    const data = await this.repo.getRecentEvaluations();
    if (data.some(d => d.status === 'failed')) PlatformEventBus.publish('widget:event', { type: 'WIDGET_REFRESHED', source: 'governance', timestamp: new Date(), widgetId: 'policy-explorer' });
    return data;
  }
}
export const governanceService = new GovernanceService(new GovernanceRepository());