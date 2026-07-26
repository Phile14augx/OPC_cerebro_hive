
import { PluginManifest } from '@cerebro/plugins';

export const MarketplacePlugin: PluginManifest = {
  id: 'cerebro.marketplace',
  version: '1.0.0',
  metadata: { name: 'Marketplace', description: 'Governed Asset Catalog', author: 'Cerebro' },
  capabilities: { provides: ['dashboard.marketplace'], requires: ['eventbus'] },
  lifecycle: {
    install: () => {}, activate: () => {}, deactivate: () => {}, dispose: () => {}
  }
};
