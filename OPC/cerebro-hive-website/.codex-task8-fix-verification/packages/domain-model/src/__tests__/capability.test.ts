import { describe, expect, it } from 'vitest';
import { HiveCapability } from '../enums/HiveCapability';
import { HiveCapabilityMaturity } from '../capability/HiveCapabilityMaturity';
import { isHiveCapabilityVersion } from '../capability/HiveCapabilityVersion';
import {
  isHiveCapabilityDescriptor,
  type HiveCapabilityDescriptor,
} from '../capability/HiveCapabilityDescriptor';
import type { HiveCapabilityMetadata } from '../capability/HiveCapabilityMetadata';
import type {
  HiveCapabilityRegistry,
  HiveCapabilityResolver,
  HiveCapabilityValidator,
  HiveCapabilityRegistryRepository,
} from '../capability/HiveCapabilityRegistry';
import type { HiveCapabilityProvider } from '../capability/HiveCapabilityProvider';

function buildSampleDescriptor(): HiveCapabilityDescriptor {
  const metadata: HiveCapabilityMetadata = {
    capability: HiveCapability.HiveCompute,
    displayName: 'HiveCompute',
    version: '1.0.0',
    maturity: HiveCapabilityMaturity.Experimental,
    owner: 'platform-team',
  };
  return {
    capability: HiveCapability.HiveCompute,
    features: ['gpu-compute', 'spot-pricing'],
    metadata,
    dependencies: [],
  };
}

describe('HiveCapabilityVersion', () => {
  it('accepts a valid semver string', () => {
    expect(isHiveCapabilityVersion('1.4.0')).toBe(true);
    expect(isHiveCapabilityVersion('0.1.0-beta.1')).toBe(true);
  });

  it('rejects malformed strings', () => {
    expect(isHiveCapabilityVersion('v1.4')).toBe(false);
    expect(isHiveCapabilityVersion('')).toBe(false);
    expect(isHiveCapabilityVersion(42)).toBe(false);
  });
});

describe('HiveCapabilityDescriptor', () => {
  it('is constructible against the fixed HiveCapability vocabulary', () => {
    const descriptor = buildSampleDescriptor();
    expect(descriptor.capability).toBe('HiveCompute');
    expect(descriptor.features).toContain('gpu-compute');
  });

  it('type-guards a well-formed descriptor', () => {
    expect(isHiveCapabilityDescriptor(buildSampleDescriptor())).toBe(true);
  });

  it('rejects malformed input', () => {
    expect(isHiveCapabilityDescriptor(null)).toBe(false);
    expect(isHiveCapabilityDescriptor({})).toBe(false);
    expect(isHiveCapabilityDescriptor({ capability: 'HiveCompute' })).toBe(false);
  });
});

describe('Capability contracts are implementable (compile-time + minimal runtime check)', () => {
  it('a HiveCapabilityRegistry implementation satisfies the interface', () => {
    const store = new Map<string, HiveCapabilityDescriptor>();
    const registry: HiveCapabilityRegistry = {
      register(descriptor) {
        store.set(descriptor.capability, descriptor);
      },
      get(capability) {
        return store.get(capability);
      },
      list() {
        return Array.from(store.values());
      },
    };

    registry.register(buildSampleDescriptor());
    expect(registry.get(HiveCapability.HiveCompute)?.features).toContain('gpu-compute');
    expect(registry.list()).toHaveLength(1);
  });

  it('a HiveCapabilityResolver implementation satisfies the interface', () => {
    const resolver: HiveCapabilityResolver = {
      resolveDependencies() {
        return [];
      },
    };
    expect(resolver.resolveDependencies(HiveCapability.HiveDatabase)).toEqual([]);
  });

  it('a HiveCapabilityValidator implementation satisfies the interface', () => {
    const validator: HiveCapabilityValidator = {
      validate(descriptor) {
        return descriptor.dependencies.length === 0
          ? { valid: true, errors: [] }
          : { valid: false, errors: ['unresolved dependency'] };
      },
    };
    expect(validator.validate(buildSampleDescriptor())).toEqual({ valid: true, errors: [] });
  });

  it('a HiveCapabilityRegistryRepository implementation satisfies the interface (no real persistence)', async () => {
    const store = new Map<string, HiveCapabilityDescriptor>();
    const repository: HiveCapabilityRegistryRepository = {
      async save(descriptor) {
        store.set(descriptor.capability, descriptor);
      },
      async findByCapability(capability) {
        return store.get(capability);
      },
      async list() {
        return Array.from(store.values());
      },
    };

    await repository.save(buildSampleDescriptor());
    await expect(repository.findByCapability(HiveCapability.HiveCompute)).resolves.toBeDefined();
    await expect(repository.list()).resolves.toHaveLength(1);
  });

  it('a HiveCapabilityProvider implementation satisfies the interface', async () => {
    const provider: HiveCapabilityProvider = {
      async describeCapabilities() {
        return [buildSampleDescriptor()];
      },
    };
    await expect(provider.describeCapabilities()).resolves.toHaveLength(1);
  });
});
