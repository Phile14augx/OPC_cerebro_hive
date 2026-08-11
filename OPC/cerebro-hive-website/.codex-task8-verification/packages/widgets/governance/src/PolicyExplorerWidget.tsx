import React, { useEffect } from 'react';
import { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';
import { useRecentEvaluations } from '@cerebro/governance-api';
import { CardContent, Badge } from '@cerebro/ui';

export const PolicyExplorerWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  const { data, isLoading, isError } = useRecentEvaluations();
  useEffect(() => {
    if (isLoading) onStateChange('loading');
    else if (isError) onStateChange('error');
    else if (data) onStateChange('ready');
  }, [isLoading, isError, data, onStateChange]);
  if (state !== 'ready' || !data) return null;
  return (
    <CardContent className="flex flex-col gap-2 py-4">
      {data.map(e => (
        <div key={e.id} className="flex justify-between items-center p-2 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)]">
          <span className="text-sm font-medium">{e.policy}</span>
          <Badge variant={e.status === 'passed' ? 'outline' : 'destructive'}>{e.status}</Badge>
        </div>
      ))}
    </CardContent>
  );
};