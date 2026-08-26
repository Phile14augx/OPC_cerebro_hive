
import { PlatformEventBus } from '@cerebro/events';

export const emitSwarmEvent = (type: string, payload: unknown) => {
  // Simulating publishing out to the global event bus
  PlatformEventBus.publish('telemetry:event', {
    type,
    severity: 'info',
    timestamp: new Date(),
    source: 'swarm-runtime',
    details: payload
  });
};
