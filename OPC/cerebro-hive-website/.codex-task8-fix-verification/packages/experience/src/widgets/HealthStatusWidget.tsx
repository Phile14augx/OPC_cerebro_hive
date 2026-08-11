
import React, { useEffect } from 'react';
import { WidgetProps } from './WidgetLifecycle';
import { CardContent, Badge } from '@cerebro/ui';

export const HealthStatusWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  useEffect(() => {
    // Simulate instant readiness for this static/health widget for now
    onStateChange('ready');
  }, [onStateChange]);

  if (state !== 'ready') return null;

  return (
    <CardContent className="flex flex-col gap-3 py-4 px-2">
      <div className="flex justify-between items-center p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[var(--color-text-success)] shadow-[0_0_8px_var(--color-text-success)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Vector Database</span>
        </div>
        <Badge variant="outline">Operational</Badge>
      </div>
      <div className="flex justify-between items-center p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[var(--color-text-warning)] shadow-[0_0_8px_var(--color-text-warning)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">LLM Router</span>
        </div>
        <Badge variant="outline" className="border-[var(--color-text-warning)] text-[var(--color-text-warning)]">Degraded</Badge>
      </div>
      <div className="flex justify-between items-center p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[var(--color-text-success)] shadow-[0_0_8px_var(--color-text-success)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Event Streaming</span>
        </div>
        <Badge variant="outline">Operational</Badge>
      </div>
    </CardContent>
  );
};
