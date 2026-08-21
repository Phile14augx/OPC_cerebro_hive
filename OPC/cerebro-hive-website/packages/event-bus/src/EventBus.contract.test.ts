import { describe, it, expect } from 'vitest';
import { EventBus } from './EventBus';
describe('EventBus Contract', () => {
  it('should instantiate without connecting', () => {
    const bus = new EventBus();
    expect(bus).toBeDefined();
  });
  it('should throw when publishing without connection (Negative Control)', async () => {
    const bus = new EventBus();
    await expect(bus.publish('test', { id: 'e1', type: 'test', payload: {} } as any))
      .rejects.toThrow('EventBus is not connected');
  });
});