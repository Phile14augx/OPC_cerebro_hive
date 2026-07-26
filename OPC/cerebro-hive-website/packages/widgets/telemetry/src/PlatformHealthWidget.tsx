
import React, { useEffect } from 'react';
import { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';
import { usePlatformHealth } from '@cerebro/telemetry-api';
import { CardContent, Badge } from '@cerebro/ui';

export const PlatformHealthWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {
  const { data, isLoading, isError } = usePlatformHealth();

  useEffect(() => {
    if (isLoading) onStateChange('loading');
    else if (isError) onStateChange('error');
    else if (data) onStateChange('ready');
  }, [isLoading, isError, data, onStateChange]);

  if (state !== 'ready' || !data) return null;

  return (
    <CardContent className="flex flex-col items-center justify-center py-8">
       <div className={`w-24 h-24 rounded-full flex items-center justify-center ${data.status === 'healthy' ? 'bg-[var(--color-text-success)]/10 text-[var(--color-text-success)]' : 'bg-[var(--color-text-warning)]/10 text-[var(--color-text-warning)]'}`}>
         <span className="text-4xl">✓</span>
       </div>
       <h3 className="text-xl font-bold mt-4 text-[var(--color-text-primary)] capitalize">{data.status}</h3>
       <p className="text-[var(--color-text-secondary)] mt-1">{data.uptimePercentage}% Uptime</p>
    </CardContent>
  );
};
