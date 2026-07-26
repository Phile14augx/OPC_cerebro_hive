const fs = require('fs');
const path = require('path');

const pulseAppDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'apps', 'pulse', 'app');
const dashboardDir = path.join(pulseAppDir, 'dashboard', '[module]');

fs.mkdirSync(dashboardDir, { recursive: true });

// Move page.tsx to dashboard route
const oldPagePath = path.join(pulseAppDir, 'page.tsx');
let pageContent = fs.readFileSync(oldPagePath, 'utf8');

// Update to support dynamic dashboard layouts
fs.writeFileSync(path.join(dashboardDir, 'page.tsx'), `
import React from 'react';
import { WidgetRegistry } from '@cerebro/experience/widgets/WidgetRegistry';
import { WidgetHost } from '@cerebro/experience/widgets/WidgetHost';
import { useDashboardRefreshCoordinator } from '@cerebro/data-core';

// We simulate DashboardRepository fetching a layout config based on the route
const MOCK_LAYOUTS: Record<string, { title: string; desc: string; widgetIds: string[] }> = {
  'mission-control': {
    title: 'Mission Control',
    desc: 'Overview of Cerebro Hive operations.',
    widgetIds: ['kpi-overview', 'health-status']
  },
  'telemetry': {
    title: 'Operational Telemetry',
    desc: 'Runtime insight and system metrics.',
    widgetIds: ['platform-health', 'active-jobs']
  },
  'governance': {
    title: 'Governance & Policy',
    desc: 'Policy engine evaluations and audit history.',
    widgetIds: ['policy-explorer', 'decision-timeline']
  },
  'observability': {
    title: 'Observability',
    desc: 'Trace viewer and execution timelines.',
    widgetIds: ['trace-viewer', 'agent-timeline']
  },
  'intelligence': {
    title: 'Platform Intelligence',
    desc: 'AI-native operational insights and recommendations.',
    widgetIds: ['ai-recommendations']
  }
};

export default function DashboardPage({ params }: { params: { module: string } }) {
  useDashboardRefreshCoordinator();

  const layout = MOCK_LAYOUTS[params.module] || MOCK_LAYOUTS['mission-control'];
  
  // Only render widgets explicitly defined in the dashboard's layout configuration
  const allWidgets = WidgetRegistry.getAll();
  const activeWidgets = layout.widgetIds.map(id => allWidgets.find(w => w.id === id)).filter(Boolean);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8 border-b border-[var(--color-border-subtle)] pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] capitalize">
          {layout.title}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          {layout.desc}
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        {activeWidgets.map(widget => widget && (
          <div 
            key={widget.id} 
            className="flex flex-col"
            style={{ 
              gridColumn: \`span \${widget.columnSpan} / span \${widget.columnSpan}\`, 
              gridRow: \`span \${widget.rowSpan} / span \${widget.rowSpan}\` 
            }}
          >
            <WidgetHost widgetId={widget.id} definition={widget} />
          </div>
        ))}

        {activeWidgets.length === 0 && (
          <div className="col-span-full py-12 flex flex-col gap-2 items-center justify-center border-2 border-dashed border-[var(--color-border-muted)] rounded-[var(--radius-lg)]">
            <span className="text-[var(--color-text-primary)] font-medium">No widgets configured</span>
            <span className="text-[var(--color-text-muted)] text-sm">Widgets for this layout have not been registered yet.</span>
          </div>
        )}
      </div>
    </div>
  );
}
`);

// Add a redirect from / to /dashboard/mission-control
fs.writeFileSync(oldPagePath, `
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/dashboard/mission-control');
}
`);

console.log('Phase 2: Multi-dashboard routing complete');
