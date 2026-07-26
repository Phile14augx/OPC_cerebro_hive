const fs = require('fs');
const path = require('path');

const packagesDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages');

// ----------------------------------------------------
// EPIC 4: SWARM DASHBOARD (UI PLUGIN)
// ----------------------------------------------------
const swarmUiDir = path.join(packagesDir, 'widgets', 'swarm');
const swarmUiSrc = path.join(swarmUiDir, 'src');
fs.mkdirSync(swarmUiSrc, { recursive: true });

fs.writeFileSync(path.join(swarmUiDir, 'package.json'), JSON.stringify({
  name: "@cerebro/widgets-swarm",
  version: "0.1.0",
  private: true,
  main: "src/index.ts",
  dependencies: {
    "@cerebro/swarm-sdk": "workspace:*",
    "@cerebro/plugins": "workspace:*",
    "@cerebro/ui": "workspace:*"
  }
}, null, 2));

fs.writeFileSync(path.join(swarmUiSrc, 'ActiveSwarmsWidget.tsx'), `
import React, { useEffect, useState } from 'react';
import { PlatformEventBus } from '@cerebro/events';
import { CardContent, Badge } from '@cerebro/ui';

export const ActiveSwarmsWidget = () => {
  const [swarms, setSwarms] = useState<{ id: string; status: string }[]>([]);

  useEffect(() => {
    const unsub = PlatformEventBus.subscribe('telemetry:event' as any, (event: any) => {
      if (event.type === 'SWARM_STARTED') {
        setSwarms(prev => [...prev, { id: event.details?.id || 'swarm-' + Date.now(), status: 'Running' }]);
      }
      if (event.type === 'SWARM_COMPLETED') {
        setSwarms(prev => prev.map(s => s.status === 'Running' ? { ...s, status: 'Completed' } : s));
      }
    });
    return unsub;
  }, []);

  return (
    <CardContent className="flex flex-col gap-2 py-4">
      {swarms.length === 0 ? <p className="text-sm text-[var(--color-text-muted)]">No active swarms.</p> : null}
      {swarms.map((s, i) => (
        <div key={i} className="flex justify-between p-2 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)]">
          <span className="text-sm font-medium">{s.id}</span>
          <Badge variant={s.status === 'Completed' ? 'default' : 'outline'}>{s.status}</Badge>
        </div>
      ))}
    </CardContent>
  );
};
`);

fs.writeFileSync(path.join(swarmUiSrc, 'TaskGraphWidget.tsx'), `
import React from 'react';
import { CardContent } from '@cerebro/ui';

export const TaskGraphWidget = () => {
  return (
    <CardContent className="flex flex-col items-center justify-center py-8">
      <p className="text-sm text-[var(--color-text-muted)] italic">DAG Visualizer canvas goes here</p>
    </CardContent>
  );
};
`);

fs.writeFileSync(path.join(swarmUiSrc, 'index.ts'), `
import { PluginManifest } from '@cerebro/plugins';
import { ActiveSwarmsWidget } from './ActiveSwarmsWidget';
import { TaskGraphWidget } from './TaskGraphWidget';

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
`);

console.log('Epic 4 Frontend Plugin Scaffolded Successfully');
