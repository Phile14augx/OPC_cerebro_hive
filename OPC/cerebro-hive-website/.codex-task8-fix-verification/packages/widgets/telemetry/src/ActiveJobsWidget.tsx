
import React, { useEffect } from 'react';
import { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';
import { useQueueMetrics } from '@cerebro/telemetry-api';
import { CardContent } from '@cerebro/ui';

export const ActiveJobsWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  const { data, isLoading, isError } = useQueueMetrics();

  useEffect(() => {
    if (isLoading) onStateChange('loading');
    else if (isError) onStateChange('error');
    else if (data) onStateChange('ready');
  }, [isLoading, isError, data, onStateChange]);

  if (state !== 'ready' || !data) return null;

  return (
    <CardContent className="flex flex-col gap-4 py-4 px-2">
      <div className="flex justify-between items-end pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Active Jobs</p>
          <p className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mt-1">{data.activeJobs}</p>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Pending Queue</p>
          <p className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mt-1">{data.pendingJobs}</p>
        </div>
      </div>
    </CardContent>
  );
};
