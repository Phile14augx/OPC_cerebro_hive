import { describe, it, expect } from 'vitest';
import { CapabilityRegistry } from './CapabilityRegistry';
import { PluginManager } from './PluginManager';
import type { PluginManifest } from './PluginManifest';

describe('Plugins Contract', () => {
  it('should register and validate a capability', () => {
    CapabilityRegistry.register('cerebro.knowledge.retrieval');
    expect(CapabilityRegistry.has('cerebro.knowledge.retrieval')).toBe(true);
  });

  it('should reject a plugin with missing required capabilities (Negative Control)', async () => {
    const plugin: PluginManifest = {
      id: 'test-plugin',
      version: '1.0.0',
      metadata: { name: 'Test', description: 'Test plugin', author: 'team-a' },
      capabilities: { provides: [], requires: ['cerebro.missing.capability'] },
      lifecycle: {
        install: async () => {},
        activate: async () => {},
        deactivate: async () => {},
        dispose: async () => {},
      },
    };
    const result = await PluginManager.register(plugin);
    expect(result).toBe(false);
  });
});
