import { describe, it, expect } from 'vitest';
import type { TelemetryStore, EventBus, SimulationEngine } from './ports';
describe('TwinDomain Ports Contract', () => {
  it('should accept a mock TelemetryStore implementation', () => {
    const store: TelemetryStore = { append: async () => {} };
    expect(store).toBeDefined();
    expect(store.append).toBeTypeOf('function');
  });
  it('should accept a mock EventBus implementation (Negative Control)', () => {
    const bus: EventBus = { publish: async () => {} };
    expect(bus.publish).toBeTypeOf('function');
  });
});