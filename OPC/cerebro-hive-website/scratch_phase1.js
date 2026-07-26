const fs = require('fs');
const path = require('path');

const expDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'experience', 'src');
const widgetDir = path.join(expDir, 'widgets');

// 1. Extend WidgetRegistry
fs.writeFileSync(path.join(widgetDir, 'WidgetRegistry.ts'), `
export type RefreshPolicy = 'manual' | '30s' | '1m' | 'background';

export interface WidgetAction {
  id: string;
  label: string;
  icon?: string;
  handler: (instanceId: string) => void;
}

export interface WidgetDefinition {
  id: string;
  title: string;
  category: string;
  icon: string;
  // CSS Grid layout constraints
  columnSpan: number;
  rowSpan: number;
  minimumWidth?: number;
  permissions: string[];
  defaultVisibility: boolean;
  refreshPolicy: RefreshPolicy;
  actions?: WidgetAction[];
  component: React.ComponentType<any>;
}

class WidgetRegistryImpl {
  private widgets = new Map<string, WidgetDefinition>();

  register(widget: WidgetDefinition) {
    this.widgets.set(widget.id, widget);
  }

  getWidget(id: string) {
    return this.widgets.get(id);
  }

  getAll() {
    return Array.from(this.widgets.values());
  }
}

export const WidgetRegistry = new WidgetRegistryImpl();
`);

// 2. Central Refresh Coordinator
const dataCoreDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'data-core', 'src');
const hooksDir = path.join(dataCoreDir, 'hooks');
fs.mkdirSync(hooksDir, { recursive: true });

fs.writeFileSync(path.join(hooksDir, 'useDashboardRefreshCoordinator.ts'), `
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// A central coordinator that triggers Query invalidations based on platform policies
export function useDashboardRefreshCoordinator() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer30s = setInterval(() => {
      // Invalidate queries that belong to widgets with 30s refresh policy
      queryClient.invalidateQueries({ predicate: (query) => query.meta?.refreshPolicy === '30s' });
    }, 30000);

    const timer1m = setInterval(() => {
      queryClient.invalidateQueries({ predicate: (query) => query.meta?.refreshPolicy === '1m' });
    }, 60000);

    return () => {
      clearInterval(timer30s);
      clearInterval(timer1m);
    };
  }, [queryClient]);
}
`);

// Export hook
fs.writeFileSync(path.join(dataCoreDir, 'index.ts'), `
export * from './repositories/DashboardRepository';
export * from './hooks/useDashboardRefreshCoordinator';
`);

console.log('Phase 1 executed successfully');
