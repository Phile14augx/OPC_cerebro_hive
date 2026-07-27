import { describe, it, expect, beforeEach } from 'vitest';
import { RuntimeRegistry } from './RuntimeRegistry';
import { CapabilityDescriptor } from './CapabilityDescriptor';
import type { LLMProvider, LLMMessage } from '../plugins/CapabilityProvider';

class DummyLLM implements LLMProvider {
  constructor(private readonly label: string) {}
  async invokeModel(_messages: LLMMessage[], _context: any): Promise<string> {
    return this.label;
  }
}

function llm(name: string, priority: number, extra: Partial<{ costClass: 'Low' | 'Medium' | 'High' }> = {}) {
  const descriptor = new CapabilityDescriptor<LLMProvider>(
    { name, capability: 'LLMProvider', version: '1', priority, ...extra },
    () => new DummyLLM(name)
  );
  descriptor.setHealth('Healthy');
  return descriptor;
}

describe('RuntimeRegistry', () => {
  beforeEach(async () => {
    await RuntimeRegistry.getInstance().clearAll();
  });

  it('resolves the highest-priority healthy provider', async () => {
    const registry = RuntimeRegistry.getInstance();
    registry.register(llm('Low', 1));
    registry.register(llm('High', 10));

    const resolved = await registry.resolve<LLMProvider>({ capability: 'LLMProvider' });
    await expect(resolved.invokeModel([], {})).resolves.toBe('High');
  });

  it('falls back to a lower-priority provider when the higher one is unavailable', async () => {
    const registry = RuntimeRegistry.getInstance();
    const low = llm('Low', 1);
    const high = llm('High', 10);
    high.setHealth('Unavailable');
    registry.register(low);
    registry.register(high);

    const resolved = await registry.resolve<LLMProvider>({ capability: 'LLMProvider' });
    await expect(resolved.invokeModel([], {})).resolves.toBe('Low');
  });

  it('treats Degraded as still resolvable', async () => {
    const registry = RuntimeRegistry.getInstance();
    const degraded = llm('Degraded-Provider', 10);
    degraded.setHealth('Degraded');
    registry.register(degraded);

    const resolved = await registry.resolve<LLMProvider>({ capability: 'LLMProvider' });
    await expect(resolved.invokeModel([], {})).resolves.toBe('Degraded-Provider');
  });

  it('filters by costClass constraint', async () => {
    const registry = RuntimeRegistry.getInstance();
    registry.register(llm('Cheap', 1, { costClass: 'Low' }));
    registry.register(llm('Expensive', 100, { costClass: 'High' }));

    const resolved = await registry.resolve<LLMProvider>({ capability: 'LLMProvider', costClass: 'Low' });
    await expect(resolved.invokeModel([], {})).resolves.toBe('Cheap');

    await expect(
      registry.resolve<LLMProvider>({ capability: 'LLMProvider', costClass: 'Medium' })
    ).rejects.toThrow();
  });

  it('resolves an exact name match regardless of priority', async () => {
    const registry = RuntimeRegistry.getInstance();
    registry.register(llm('Low', 1));
    registry.register(llm('High', 10));

    const resolved = await registry.resolve<LLMProvider>({ capability: 'LLMProvider', name: 'Low' });
    await expect(resolved.invokeModel([], {})).resolves.toBe('Low');
  });

  it('throws when an exact name match does not exist', async () => {
    const registry = RuntimeRegistry.getInstance();
    registry.register(llm('Low', 1));

    await expect(
      registry.resolve<LLMProvider>({ capability: 'LLMProvider', name: 'Nonexistent' })
    ).rejects.toThrow();
  });

  it('throws when registering a duplicate name for the same capability', () => {
    const registry = RuntimeRegistry.getInstance();
    registry.register(llm('Dup', 1));
    expect(() => registry.register(llm('Dup', 2))).toThrow();
  });

  it('throws when no provider is registered for a capability at all', async () => {
    const registry = RuntimeRegistry.getInstance();
    await expect(registry.resolve({ capability: 'LLMProvider' })).rejects.toThrow();
  });

  it('unregister removes a provider so it is no longer resolvable', async () => {
    const registry = RuntimeRegistry.getInstance();
    registry.register(llm('Solo', 1));
    await registry.unregister('LLMProvider', 'Solo');

    await expect(registry.resolve({ capability: 'LLMProvider' })).rejects.toThrow();
  });
});
