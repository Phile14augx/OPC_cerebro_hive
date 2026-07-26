const fs = require('fs');
const path = require('path');

const packagesDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages');

// ----------------------------------------------------
// 1. telemetry-api
// ----------------------------------------------------
const telemetryApiDir = path.join(packagesDir, 'telemetry-api');
const telemetryApiSrc = path.join(telemetryApiDir, 'src');
fs.mkdirSync(telemetryApiSrc, { recursive: true });

fs.writeFileSync(path.join(telemetryApiDir, 'package.json'), JSON.stringify({
  name: "@cerebro/telemetry-api",
  version: "0.1.0",
  private: true,
  main: "src/index.ts",
  dependencies: {
    "@tanstack/react-query": "^5.0.0",
    "@cerebro/events": "workspace:*"
  }
}, null, 2));

// Types
fs.writeFileSync(path.join(telemetryApiSrc, 'TelemetryTypes.ts'), `
export interface PlatformHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptimePercentage: number;
  lastIncidentMs: number;
}

export interface QueueMetrics {
  activeJobs: number;
  pendingJobs: number;
  failedJobs: number;
  averageLatencyMs: number;
}
`);

// Repository
fs.writeFileSync(path.join(telemetryApiSrc, 'TelemetryRepository.ts'), `
import { PlatformHealth, QueueMetrics } from './TelemetryTypes';

export class TelemetryRepository {
  async getHealth(): Promise<PlatformHealth> {
    await new Promise(r => setTimeout(r, 600));
    return { status: 'healthy', uptimePercentage: 99.98, lastIncidentMs: Date.now() - 86400000 };
  }

  async getQueueMetrics(): Promise<QueueMetrics> {
    await new Promise(r => setTimeout(r, 400));
    return { activeJobs: 342, pendingJobs: 1205, failedJobs: 12, averageLatencyMs: 45.2 };
  }
}
`);

// Service
fs.writeFileSync(path.join(telemetryApiSrc, 'TelemetryService.ts'), `
import { TelemetryRepository } from './TelemetryRepository';
import { PlatformEventBus } from '@cerebro/events';

export class TelemetryService {
  constructor(private repo: TelemetryRepository) {}

  async fetchHealth() {
    const data = await this.repo.getHealth();
    if (data.status !== 'healthy') {
       PlatformEventBus.publish('telemetry:event', {
         type: 'SYSTEM_DEGRADED',
         severity: data.status === 'critical' ? 'critical' : 'warning',
         timestamp: new Date(),
         source: 'TelemetryService',
         details: { uptime: data.uptimePercentage }
       });
    }
    return data;
  }

  async fetchQueueMetrics() {
    return this.repo.getQueueMetrics();
  }
}
export const telemetryService = new TelemetryService(new TelemetryRepository());
`);

// Hooks
fs.writeFileSync(path.join(telemetryApiSrc, 'TelemetryHooks.ts'), `
import { useQuery } from '@tanstack/react-query';
import { telemetryService } from './TelemetryService';

export const usePlatformHealth = () => useQuery({
  queryKey: ['telemetry', 'health'],
  queryFn: () => telemetryService.fetchHealth(),
  meta: { refreshPolicy: '1m' }
});

export const useQueueMetrics = () => useQuery({
  queryKey: ['telemetry', 'queue'],
  queryFn: () => telemetryService.fetchQueueMetrics(),
  meta: { refreshPolicy: '30s' }
});
`);

fs.writeFileSync(path.join(telemetryApiSrc, 'index.ts'), `
export * from './TelemetryTypes';
export * from './TelemetryService';
export * from './TelemetryHooks';
`);


// ----------------------------------------------------
// 2. widgets/telemetry
// ----------------------------------------------------
const widgetsTelemetryDir = path.join(packagesDir, 'widgets', 'telemetry');
const widgetsTelemetrySrc = path.join(widgetsTelemetryDir, 'src');
fs.mkdirSync(widgetsTelemetrySrc, { recursive: true });

fs.writeFileSync(path.join(widgetsTelemetryDir, 'package.json'), JSON.stringify({
  name: "@cerebro/widgets-telemetry",
  version: "0.1.0",
  private: true,
  main: "src/index.ts",
  dependencies: {
    "@cerebro/telemetry-api": "workspace:*",
    "@cerebro/experience": "workspace:*",
    "@cerebro/ui": "workspace:*"
  }
}, null, 2));

// PlatformHealthWidget
fs.writeFileSync(path.join(widgetsTelemetrySrc, 'PlatformHealthWidget.tsx'), `
import React, { useEffect } from 'react';
import { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';
import { usePlatformHealth } from '@cerebro/telemetry-api';
import { CardContent, Badge } from '@cerebro/ui';

export const PlatformHealthWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  const { data, isLoading, isError } = usePlatformHealth();

  useEffect(() => {
    if (isLoading) onStateChange('loading');
    else if (isError) onStateChange('error');
    else if (data) onStateChange('ready');
  }, [isLoading, isError, data, onStateChange]);

  if (state !== 'ready' || !data) return null;

  return (
    <CardContent className="flex flex-col items-center justify-center py-8">
       <div className={\`w-24 h-24 rounded-full flex items-center justify-center \${data.status === 'healthy' ? 'bg-[var(--color-text-success)]/10 text-[var(--color-text-success)]' : 'bg-[var(--color-text-warning)]/10 text-[var(--color-text-warning)]'}\`}>
         <span className="text-4xl">✓</span>
       </div>
       <h3 className="text-xl font-bold mt-4 text-[var(--color-text-primary)] capitalize">{data.status}</h3>
       <p className="text-[var(--color-text-secondary)] mt-1">{data.uptimePercentage}% Uptime</p>
    </CardContent>
  );
};
`);

// ActiveJobsWidget
fs.writeFileSync(path.join(widgetsTelemetrySrc, 'ActiveJobsWidget.tsx'), `
import React, { useEffect } from 'react';
import { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';
import { useQueueMetrics } from '@cerebro/telemetry-api';
import { CardContent } from '@cerebro/ui';

export const ActiveJobsWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  const { data, isLoading, isError } = useQueueMetrics();

  useEffect(() => {
    if (isLoading) onStateChange('loading');
    else if (isError) onStateChange('error');
    else if (data) onStateChange('ready');
  }, [isLoading, isError, data, onStateChange]);

  if (state !== 'ready' || !data) return null;

  return (
    <CardContent className="flex flex-col gap-4 py-4 px-2">
      <div className="flex justify-between items-end pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Active Jobs</p>
          <p className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mt-1">{data.activeJobs}</p>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Pending Queue</p>
          <p className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mt-1">{data.pendingJobs}</p>
        </div>
      </div>
    </CardContent>
  );
};
`);

// Register
fs.writeFileSync(path.join(widgetsTelemetrySrc, 'index.ts'), `
import { WidgetRegistry } from '@cerebro/experience/widgets/WidgetRegistry';
import { PlatformHealthWidget } from './PlatformHealthWidget';
import { ActiveJobsWidget } from './ActiveJobsWidget';

export const registerTelemetryWidgets = () => {
  WidgetRegistry.register({
    id: 'platform-health',
    title: 'Platform Health',
    category: 'Telemetry',
    icon: 'activity',
    columnSpan: 1,
    rowSpan: 1,
    defaultVisibility: true,
    permissions: ['*'],
    refreshPolicy: '1m',
    component: PlatformHealthWidget
  });

  WidgetRegistry.register({
    id: 'active-jobs',
    title: 'Active Jobs',
    category: 'Telemetry',
    icon: 'list',
    columnSpan: 1,
    rowSpan: 1,
    defaultVisibility: true,
    permissions: ['*'],
    refreshPolicy: '30s',
    component: ActiveJobsWidget
  });
};
`);

console.log('Phase 3: Operational Telemetry generated successfully');
