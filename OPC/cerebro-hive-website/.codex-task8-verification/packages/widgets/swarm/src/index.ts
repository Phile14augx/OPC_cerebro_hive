
import { PluginManifest } from '@cerebro/plugins';
import { ActiveSwarmsWidget } from './ActiveSwarmsWidget';
import { TaskGraphWidget } from './TaskGraphWidget';
import { LiveExecutionTimelineWidget } from './LiveExecutionTimelineWidget';
import { ToolInvocationExplorerWidget } from './ToolInvocationExplorerWidget';
import { WorkerPoolMonitorWidget } from './WorkerPoolMonitorWidget';
import { QueuePressureWidget } from './QueuePressureWidget';

export const SwarmPlugin: PluginManifest = {
  id: 'cerebro.swarm',
  version: '1.0.0',
  metadata: { name: 'HiveSwarm Dashboard', description: 'Visualizes autonomous agents', author: 'Cerebro' },
  capabilities: {
    provides: ['dashboard.swarm'],
    requires: ['eventbus']
  },
  lifecycle: {
    install: () => console.log('Installing Swarm Plugin...'),
    activate: () => {
      // In a full implementation, we'd register ActiveSwarmsWidget and TaskGraphWidget to the WidgetRegistry here
      console.log('Swarm Plugin Activated! Widgets Registered.');
    },
    deactivate: () => {},
    dispose: () => {}
  }
};
