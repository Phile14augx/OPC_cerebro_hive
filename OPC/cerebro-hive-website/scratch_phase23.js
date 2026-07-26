const fs = require('fs');
const path = require('path');

const expDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'experience', 'src');
const widgetDir = path.join(expDir, 'widgets');
const dataCoreDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'data-core', 'src');

// 1. Data Core Hooks
const hooksDir = path.join(dataCoreDir, 'hooks');
fs.mkdirSync(hooksDir, { recursive: true });
fs.writeFileSync(path.join(hooksDir, 'useDashboardMetrics.ts'), `
import { useQuery } from '@tanstack/react-query';
import { dashboardRepository } from '../repositories/DashboardRepository';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard_metrics'],
    queryFn: () => dashboardRepository.getMetrics(),
    meta: {
      refreshPolicy: '30s'
    }
  });
}
`);

fs.writeFileSync(path.join(dataCoreDir, 'index.ts'), `
export * from './repositories/DashboardRepository';
export * from './hooks/useDashboardRefreshCoordinator';
export * from './hooks/useDashboardMetrics';
`);

// 2. KPI Card Widget
fs.writeFileSync(path.join(widgetDir, 'KPICardWidget.tsx'), `
import React, { useEffect } from 'react';
import { WidgetProps } from './WidgetLifecycle';
import { useDashboardMetrics } from '@cerebro/data-core';
import { CardContent } from '@cerebro/ui';

export const KPICardWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  const { data, isLoading, isError } = useDashboardMetrics();

  useEffect(() => {
    if (isLoading) onStateChange('loading');
    else if (isError) onStateChange('error');
    else if (data) onStateChange('ready');
  }, [isLoading, isError, data, onStateChange]);

  if (state !== 'ready' || !data) return null;

  return (
    <CardContent className="flex flex-col gap-4 py-4 px-2">
      <div className="flex justify-between items-end border-b border-[var(--color-border-subtle)] pb-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Active Models</p>
          <p className="text-3xl font-bold tracking-tight mt-1 text-[var(--color-text-primary)]">{data.activeModels}</p>
        </div>
        <div className="text-sm text-[var(--color-text-success)] font-medium bg-[var(--color-text-success)]/10 px-2 py-1 rounded-md">
          +12% (7d)
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Ingestion Rate</p>
          <p className="text-3xl font-bold tracking-tight mt-1 text-[var(--color-text-primary)]">
            {(data.ingestionRate / 1000).toFixed(1)}k <span className="text-sm text-[var(--color-text-muted)] font-normal">rows/sec</span>
          </p>
        </div>
        <div className="text-sm text-[var(--color-text-warning)] font-medium bg-[var(--color-text-warning)]/10 px-2 py-1 rounded-md">
          -2% (1h)
        </div>
      </div>
    </CardContent>
  );
};
`);

// 3. Health Status Widget
fs.writeFileSync(path.join(widgetDir, 'HealthStatusWidget.tsx'), `
import React, { useEffect } from 'react';
import { WidgetProps } from './WidgetLifecycle';
import { CardContent, Badge } from '@cerebro/ui';

export const HealthStatusWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  useEffect(() => {
    // Simulate instant readiness for this static/health widget for now
    onStateChange('ready');
  }, [onStateChange]);

  if (state !== 'ready') return null;

  return (
    <CardContent className="flex flex-col gap-3 py-4 px-2">
      <div className="flex justify-between items-center p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[var(--color-text-success)] shadow-[0_0_8px_var(--color-text-success)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Vector Database</span>
        </div>
        <Badge variant="outline">Operational</Badge>
      </div>
      <div className="flex justify-between items-center p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[var(--color-text-warning)] shadow-[0_0_8px_var(--color-text-warning)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">LLM Router</span>
        </div>
        <Badge variant="outline" className="border-[var(--color-text-warning)] text-[var(--color-text-warning)]">Degraded</Badge>
      </div>
      <div className="flex justify-between items-center p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[var(--color-text-success)] shadow-[0_0_8px_var(--color-text-success)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Event Streaming</span>
        </div>
        <Badge variant="outline">Operational</Badge>
      </div>
    </CardContent>
  );
};
`);

// 4. Register Widgets to Registry
fs.writeFileSync(path.join(widgetDir, 'registry-init.ts'), `
import { WidgetRegistry } from './WidgetRegistry';
import { KPICardWidget } from './KPICardWidget';
import { HealthStatusWidget } from './HealthStatusWidget';

WidgetRegistry.register({
  id: 'kpi-overview',
  title: 'Executive KPI Summary',
  category: 'Metrics',
  icon: 'bar-chart',
  columnSpan: 2,
  rowSpan: 1,
  defaultVisibility: true,
  permissions: ['*'],
  refreshPolicy: '30s',
  component: KPICardWidget
});

WidgetRegistry.register({
  id: 'health-status',
  title: 'System Health',
  category: 'Observability',
  icon: 'activity',
  columnSpan: 1,
  rowSpan: 1,
  defaultVisibility: true,
  permissions: ['*'],
  refreshPolicy: '1m',
  component: HealthStatusWidget
});
`);

// Export init
fs.writeFileSync(path.join(expDir, 'index.ts'), `
export * from './navigation/RouterAdapter';
export * from './navigation/WorkspaceStore';
export * from './commands/CommandRegistry';
export * from './commands/ContextBuilder';
export * from './overlays/OverlayService';
export * from './registry/CapabilityRegistry';
export * from './lifecycle/LifecycleHooks';
export * from './shell/WorkspaceShell';
export * from './widgets/WidgetRegistry';
export * from './widgets/WidgetHost';
import './widgets/registry-init'; // Auto-register core widgets
`);

console.log('Phase 2 & 3 executed successfully');
