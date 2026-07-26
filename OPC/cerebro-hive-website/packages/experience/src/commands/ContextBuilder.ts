
import { useWorkspaceStore } from '../navigation/WorkspaceStore';

export interface CommandContext {
  workspace: string | null;
  dashboard: string | null;
  activeWidget: string | null;
  selection: any;
  filters: Record<string, any>;
  permissions: string[];
  timeRange: string;
  visibleWidgets: string[];
}

export const buildCommandContext = (): CommandContext => {
  const store = useWorkspaceStore.getState();
  return {
    workspace: store.activeModule,
    dashboard: 'mission-control',
    activeWidget: null,
    selection: null,
    filters: {},
    permissions: ['*'],
    timeRange: 'last_7_days',
    visibleWidgets: ['kpi-overview', 'health-status']
  };
};
