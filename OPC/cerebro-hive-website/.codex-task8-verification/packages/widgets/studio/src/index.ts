
import { PluginManifest } from '@cerebro/plugins';

export const StudioPlugin: PluginManifest = {
  id: 'cerebro.studio',
  version: '1.0.0',
  metadata: { name: 'Workflow Studio', description: 'Visual DAG Orchestration', author: 'Cerebro' },
  capabilities: { provides: ['dashboard.studio'], requires: ['eventbus'] },
  lifecycle: {
    install: () => {}, activate: () => {}, deactivate: () => {}, dispose: () => {}
  }
};
