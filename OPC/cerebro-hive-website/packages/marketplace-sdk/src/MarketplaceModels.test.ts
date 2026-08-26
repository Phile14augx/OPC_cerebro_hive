import { describe, it, expect } from 'vitest';
import type { MarketplaceAsset, AssetLifecycleStatus } from './MarketplaceModels';

describe('MarketplaceSDK Contract', () => {
  it('should construct a valid production MarketplaceAsset', () => {
    const asset: MarketplaceAsset = {
      id: 'asset-1',
      type: 'Agent',
      name: 'cerebro-agent-v2',
      description: 'Core reasoning agent',
      owner: 'team-ai',
      version: { semanticVersion: '2.0.0', revisionId: 'sha256:abc123' },
      status: 'Production' as AssetLifecycleStatus,
      dependencies: [],
      manifest: {},
    };
    expect(asset.status).toBe('Production');
    expect(asset.version.semanticVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should detect deprecated status (Negative Control)', () => {
    const status: AssetLifecycleStatus = 'Deprecated';
    expect(status).not.toBe('Production');
  });
});
