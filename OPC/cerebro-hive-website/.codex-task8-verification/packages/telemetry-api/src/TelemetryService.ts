
import { TelemetryRepository } from './TelemetryRepository';
import { PlatformEventBus } from '@cerebro/events';

export class TelemetryService {
  constructor(private repo: TelemetryRepository) {}

  async fetchHealth() {
    const data = await this.repo.getHealth();
    if (data.status !== 'healthy') {
       PlatformEventBus.publish('telemetry:event', {
         type: 'SYSTEM_DEGRADED',
         severity: data.status === 'critical' ? 'critical' : 'warning',
         timestamp: new Date(),
         source: 'TelemetryService',
         details: { uptime: data.uptimePercentage }
       });
    }
    return data;
  }

  async fetchQueueMetrics() {
    return this.repo.getQueueMetrics();
  }
}
export const telemetryService = new TelemetryService(new TelemetryRepository());
