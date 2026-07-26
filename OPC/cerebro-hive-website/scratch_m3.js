const fs = require('fs');
const path = require('path');

const expDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'experience', 'src');
const dataCoreDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'data-core');

// 1. Widget Registry
const widgetDir = path.join(expDir, 'widgets');
fs.mkdirSync(widgetDir, { recursive: true });

fs.writeFileSync(path.join(widgetDir, 'WidgetRegistry.ts'), `
export type RefreshPolicy = 'manual' | '30s' | '1m' | 'background';

export interface WidgetDefinition {
  id: string;
  title: string;
  category: string;
  icon: string;
  defaultSize: { w: number, h: number };
  minimumSize: { w: number, h: number };
  supportedLayouts: ('grid' | 'stack' | 'panel')[];
  permissions: string[];
  defaultVisibility: boolean;
  refreshPolicy: RefreshPolicy;
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

fs.writeFileSync(path.join(widgetDir, 'WidgetLifecycle.ts'), `
export type WidgetState = 'loading' | 'ready' | 'refreshing' | 'empty' | 'error';

export interface WidgetProps {
  instanceId: string;
  state: WidgetState;
  onStateChange: (state: WidgetState) => void;
  config: Record<string, any>;
}
`);

// 2. AI Context Builder (Command Registry Update)
fs.writeFileSync(path.join(expDir, 'commands', 'ContextBuilder.ts'), `
import { useWorkspaceStore } from '../navigation/WorkspaceStore';

export interface CommandContext {
  workspace: string | null;
  activeWidget: string | null;
  selection: any;
  filters: Record<string, any>;
  permissions: string[];
}

export const buildCommandContext = (): CommandContext => {
  const store = useWorkspaceStore.getState();
  return {
    workspace: store.activeModule,
    activeWidget: null, // Would be injected by active focus
    selection: null,
    filters: {},
    permissions: ['*'] // Placeholder for auth integration
  };
};
`);

// 3. Data Core Package
const dataSrcDir = path.join(dataCoreDir, 'src');
const repoDir = path.join(dataSrcDir, 'repositories');
fs.mkdirSync(repoDir, { recursive: true });

fs.writeFileSync(path.join(dataCoreDir, 'package.json'), JSON.stringify({
  name: "@cerebro/data-core",
  version: "0.1.0",
  private: true,
  main: "src/index.ts",
  dependencies: {
    "@tanstack/react-query": "^5.0.0"
  }
}, null, 2));

fs.writeFileSync(path.join(repoDir, 'DashboardRepository.ts'), `
// Interface
export interface DashboardMetrics {
  activeModels: number;
  ingestionRate: number;
  errorRate: number;
}

export interface IDashboardProvider {
  getMetrics(): Promise<DashboardMetrics>;
}

// Mock Provider Implementation
export class MockDashboardProvider implements IDashboardProvider {
  async getMetrics() {
    await new Promise(r => setTimeout(r, 800)); // simulate latency
    return {
      activeModels: 42,
      ingestionRate: 15400, // rows/sec
      errorRate: 0.012
    };
  }
}

// Repository
export class DashboardRepository {
  constructor(private provider: IDashboardProvider) {}

  getMetrics() {
    return this.provider.getMetrics();
  }
}

// Singleton export (Injected with Mock Provider for M3 phase 1)
export const dashboardRepository = new DashboardRepository(new MockDashboardProvider());
`);

fs.writeFileSync(path.join(dataSrcDir, 'index.ts'), `
export * from './repositories/DashboardRepository';
`);

console.log('M3 Execution scaffolded successfully');
