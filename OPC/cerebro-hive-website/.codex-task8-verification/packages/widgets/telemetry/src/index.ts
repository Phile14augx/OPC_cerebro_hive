
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
