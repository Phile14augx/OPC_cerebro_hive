import { WidgetRegistry } from '@cerebro/experience/widgets/WidgetRegistry';
import { TraceViewerWidget } from './TraceViewerWidget';

export const registerObservabilityWidgets = () => {
  WidgetRegistry.register({
    id: 'trace-viewer',
    title: 'Distributed Trace Viewer',
    category: 'Observability',
    icon: 'layout',
    columnSpan: 2,
    rowSpan: 1,
    defaultVisibility: true,
    permissions: ['*'],
    refreshPolicy: '30s',
    component: TraceViewerWidget
  });
};
