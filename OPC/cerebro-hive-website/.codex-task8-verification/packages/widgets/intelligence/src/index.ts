import { WidgetRegistry } from '@cerebro/experience/widgets/WidgetRegistry';
import { RecommendationsWidget } from './RecommendationsWidget';

export const registerIntelligenceWidgets = () => {
  WidgetRegistry.register({
    id: 'ai-recommendations',
    title: 'AI Recommendations',
    category: 'Intelligence',
    icon: 'layout',
    columnSpan: 2,
    rowSpan: 1,
    defaultVisibility: true,
    permissions: ['*'],
    refreshPolicy: '30s',
    component: RecommendationsWidget
  });
};
