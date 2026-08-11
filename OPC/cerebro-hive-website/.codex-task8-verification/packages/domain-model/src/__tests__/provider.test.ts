import { describe, expect, it } from 'vitest';
import { ProviderId, RegionId, AvailabilityZoneId, ResourceId, OperationId } from '../ids/ids';
import { ResourceLifecycleState } from '../enums/ResourceLifecycleState';
import { HiveCapability } from '../enums/HiveCapability';
import { HiveCapabilityMaturity } from '../capability/HiveCapabilityMaturity';
import type { HiveCapabilityDescriptor } from '../capability/HiveCapabilityDescriptor';
import type { HiveRegion } from '../provider/HiveRegion';
import type { HiveResourceTypeDescriptor } from '../provider/HiveResourceTypeDescriptor';
import type { HiveProviderQuota } from '../provider/HiveProviderQuota';
import type { HiveProviderMetadata } from '../provider/HiveProviderMetadata';
import type { HiveResourceSpec } from '../provider/HiveResourceSpec';
import {
  HiveProviderErrorCode,
  HIVE_PROVIDER_ERROR_RETRYABILITY,
} from '../provider/HiveProviderErrorCode';
import { HiveProviderOperationKind, type HiveProviderOperation } from '../provider/HiveProviderOperation';
import type { HiveProviderResourceState } from '../provider/HiveProviderResourceState';
import type { HiveProviderExecutor } from '../provider/HiveProviderExecutor';
import type { HiveProvider } from '../provider/HiveProvider';

function buildSampleCapabilityDescriptor(): HiveCapabilityDescriptor {
  return {
    capability: HiveCapability.HiveCompute,
    features: ['gpu-compute'],
    metadata: {
      capability: HiveCapability.HiveCompute,
      displayName: 'HiveCompute',
      version: '1.0.0',
      maturity: HiveCapabilityMaturity.Experimental,
      owner: 'platform-team',
    },
    dependencies: [],
  };
}

describe('HiveProviderErrorCode / retryability classification (ADR-027)', () => {
  it('classifies transient failures as Retryable', () => {
    expect(HIVE_PROVIDER_ERROR_RETRYABILITY[HiveProviderErrorCode.ProvisioningTimeout]).toBe('Retryable');
    expect(HIVE_PROVIDER_ERROR_RETRYABILITY[HiveProviderErrorCode.TransientProviderFailure]).toBe('Retryable');
  });

  it('classifies permanent failures as Terminal', () => {
    expect(HIVE_PROVIDER_ERROR_RETRYABILITY[HiveProviderErrorCode.QuotaExceeded]).toBe('Terminal');
    expect(HIVE_PROVIDER_ERROR_RETRYABILITY[HiveProviderErrorCode.RegionUnavailable]).toBe('Terminal');
    expect(HIVE_PROVIDER_ERROR_RETRYABILITY[HiveProviderErrorCode.AuthenticationFailed]).toBe('Terminal');
    expect(HIVE_PROVIDER_ERROR_RETRYABILITY[HiveProviderErrorCode.InvalidSpecification]).toBe('Terminal');
  });

  it('covers every HiveProviderErrorCode with exactly one classification', () => {
    const codes = Object.values(HiveProviderErrorCode);
    for (const code of codes) {
      expect(['Retryable', 'Terminal']).toContain(HIVE_PROVIDER_ERROR_RETRYABILITY[code]);
    }
  });
});

describe('Provider contracts are implementable (compile-time + minimal runtime check)', () => {
  it('a HiveProviderMetadata implementation satisfies the interface, composing HiveCapabilityProvider', async () => {
    const region: HiveRegion = {
      id: RegionId.of('region-eu-west-1'),
      displayName: 'EU West 1',
      availabilityZones: [AvailabilityZoneId.of('az-eu-west-1a')],
    };
    const resourceType: HiveResourceTypeDescriptor = {
      resourceType: 'vm',
      displayName: 'Virtual Machine',
      supportedRegions: [region.id],
      supportedLifecycleFeatures: ['Degraded'],
    };
    const quota: HiveProviderQuota = {
      resourceType: 'vm',
      region: region.id,
      limit: 100,
      used: 12,
    };

    const metadata: HiveProviderMetadata = {
      async describeCapabilities() {
        return [buildSampleCapabilityDescriptor()];
      },
      async listRegions() {
        return [region];
      },
      async listResourceTypes() {
        return [resourceType];
      },
      async getQuotas() {
        return [quota];
      },
    };

    await expect(metadata.describeCapabilities()).resolves.toHaveLength(1);
    await expect(metadata.listRegions()).resolves.toEqual([region]);
    await expect(metadata.listResourceTypes()).resolves.toEqual([resourceType]);
    await expect(metadata.getQuotas()).resolves.toEqual([quota]);
  });

  it('a HiveProviderExecutor implementation satisfies the interface across the full lifecycle', async () => {
    const providerId = ProviderId.of('provider-aws');
    const resourceId = ResourceId.of('resource-1');

    function buildOperation(
      kind: HiveProviderOperationKind,
      state: ResourceLifecycleState
    ): HiveProviderOperation {
      const now = new Date();
      return {
        id: OperationId.of(`op-${kind}`),
        kind,
        providerId,
        resourceId,
        state,
        createdAt: now,
        updatedAt: now,
      };
    }

    const executor: HiveProviderExecutor = {
      async provision(spec: HiveResourceSpec) {
        expect(spec.resourceType).toBe('vm');
        return buildOperation(HiveProviderOperationKind.Provision, ResourceLifecycleState.Requested);
      },
      async update() {
        return buildOperation(HiveProviderOperationKind.Update, ResourceLifecycleState.Updating);
      },
      async resize() {
        return buildOperation(HiveProviderOperationKind.Resize, ResourceLifecycleState.Updating);
      },
      async delete() {
        return buildOperation(HiveProviderOperationKind.Delete, ResourceLifecycleState.Deleting);
      },
      async snapshot() {
        return buildOperation(HiveProviderOperationKind.Snapshot, ResourceLifecycleState.Active);
      },
      async restore() {
        return buildOperation(HiveProviderOperationKind.Restore, ResourceLifecycleState.Provisioning);
      },
      async status(): Promise<HiveProviderResourceState> {
        return {
          resourceId,
          lifecycleState: ResourceLifecycleState.Active,
          observedAt: new Date(),
        };
      },
    };

    const spec: HiveResourceSpec = {
      resourceType: 'vm',
      region: RegionId.of('region-eu-west-1'),
      configuration: {},
    };

    const provisioned = await executor.provision(spec);
    expect(provisioned.state).toBe('Requested');
    expect(provisioned.providerId).toBe(providerId);

    const status = await executor.status(resourceId);
    expect(status.lifecycleState).toBe('Active');
    expect(status.resourceId).toBe(resourceId);
  });

  it('a HiveProvider composes matching HiveProviderMetadata/HiveProviderExecutor under one id', async () => {
    const providerId = ProviderId.of('provider-aws');

    const provider: HiveProvider = {
      id: providerId,
      displayName: 'AWS',
      metadata: {
        async describeCapabilities() {
          return [];
        },
        async listRegions() {
          return [];
        },
        async listResourceTypes() {
          return [];
        },
        async getQuotas() {
          return [];
        },
      },
      executor: {
        async provision() {
          throw new Error('not needed for this test');
        },
        async update() {
          throw new Error('not needed for this test');
        },
        async resize() {
          throw new Error('not needed for this test');
        },
        async delete() {
          throw new Error('not needed for this test');
        },
        async snapshot() {
          throw new Error('not needed for this test');
        },
        async restore() {
          throw new Error('not needed for this test');
        },
        async status() {
          throw new Error('not needed for this test');
        },
      },
    };

    expect(provider.id).toBe(providerId);
    await expect(provider.metadata.listRegions()).resolves.toEqual([]);
  });
});
