
import React, { useEffect } from 'react';
import { WidgetProps } from './WidgetLifecycle';
import { useDashboardMetrics } from '@cerebro/data-core';
import { CardContent } from '@cerebro/ui';

export const KPICardWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  const { data, isLoading, isError } = useDashboardMetrics();

  useEffect(() => {
    if (isLoading) onStateChange('loading');
    else if (isError) onStateChange('error');
    else if (data) onStateChange('ready');
  }, [isLoading, isError, data, onStateChange]);

  if (state !== 'ready' || !data) return null;

  return (
    <CardContent className="flex flex-col gap-4 py-4 px-2">
      <div className="flex justify-between items-end border-b border-[var(--color-border-subtle)] pb-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Active Models</p>
          <p className="text-3xl font-bold tracking-tight mt-1 text-[var(--color-text-primary)]">{data.activeModels}</p>
        </div>
        <div className="text-sm text-[var(--color-text-success)] font-medium bg-[var(--color-text-success)]/10 px-2 py-1 rounded-md">
          +12% (7d)
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Ingestion Rate</p>
          <p className="text-3xl font-bold tracking-tight mt-1 text-[var(--color-text-primary)]">
            {(data.ingestionRate / 1000).toFixed(1)}k <span className="text-sm text-[var(--color-text-muted)] font-normal">rows/sec</span>
          </p>
        </div>
        <div className="text-sm text-[var(--color-text-warning)] font-medium bg-[var(--color-text-warning)]/10 px-2 py-1 rounded-md">
          -2% (1h)
        </div>
      </div>
    </CardContent>
  );
};
