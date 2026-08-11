import React, { useEffect } from 'react';
import { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';
import { useRecommendations } from '@cerebro/recommendation-api';
import { CardContent, Button } from '@cerebro/ui';

export const RecommendationsWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  const { data, isLoading, isError } = useRecommendations();
  useEffect(() => {
    if (isLoading) onStateChange('loading');
    else if (isError) onStateChange('error');
    else if (data) onStateChange('ready');
  }, [isLoading, isError, data, onStateChange]);
  if (state !== 'ready' || !data) return null;
  return (
    <CardContent className="flex flex-col gap-3 py-4">
      {data.map(r => (
        <div key={r.id} className="flex justify-between items-center p-3 bg-[var(--color-surface-subtle)] rounded-lg border border-[var(--color-border-subtle)]">
          <div>
            <p className="text-sm font-medium">{r.title}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{r.impact}</p>
          </div>
          <Button size="sm" variant="outline">Apply</Button>
        </div>
      ))}
    </CardContent>
  );
};