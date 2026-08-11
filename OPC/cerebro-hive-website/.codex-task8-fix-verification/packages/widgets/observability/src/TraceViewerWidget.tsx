import React, { useEffect } from 'react';
import { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';
import { useRecentTraces } from '@cerebro/observability-api';
import { CardContent, Badge } from '@cerebro/ui';

export const TraceViewerWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  const { data, isLoading, isError } = useRecentTraces();
  useEffect(() => {
    if (isLoading) onStateChange('loading');
    else if (isError) onStateChange('error');
    else if (data) onStateChange('ready');
  }, [isLoading, isError, data, onStateChange]);
  if (state !== 'ready' || !data) return null;
  return (
    <CardContent className="flex flex-col gap-2 py-4">
      {data.map(t => (
        <div key={t.traceId} className="flex justify-between items-center p-2 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)]">
          <span className="text-sm font-medium">{t.rootSpan}</span>
          <span className="text-xs text-[var(--color-text-muted)]">{t.durationMs}ms</span>
          <Badge variant={t.error ? 'destructive' : 'outline'}>{t.error ? 'Error' : 'OK'}</Badge>
        </div>
      ))}
    </CardContent>
  );
};