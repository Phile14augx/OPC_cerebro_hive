
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
