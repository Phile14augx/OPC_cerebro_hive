
import React, { useEffect, useState } from 'react';
import { PlatformEventBus } from '@cerebro/events';
import { CardContent, Badge } from '@cerebro/ui';

export const ActiveSwarmsWidget = () => {
  const [swarms, setSwarms] = useState<{ id: string; status: string }[]>([]);

  useEffect(() => {
    const unsub = PlatformEventBus.subscribe('telemetry:event' as any, (event: any) => {
      if (event.type === 'SWARM_STARTED') {
        setSwarms(prev => [...prev, { id: event.details?.id || 'swarm-' + Date.now(), status: 'Running' }]);
      }
      if (event.type === 'SWARM_COMPLETED') {
        setSwarms(prev => prev.map(s => s.status === 'Running' ? { ...s, status: 'Completed' } : s));
      }
    });
    return unsub;
  }, []);

  return (
    <CardContent className="flex flex-col gap-2 py-4">
      {swarms.length === 0 ? <p className="text-sm text-[var(--color-text-muted)]">No active swarms.</p> : null}
      {swarms.map((s, i) => (
        <div key={i} className="flex justify-between p-2 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)]">
          <span className="text-sm font-medium">{s.id}</span>
          <Badge variant={s.status === 'Completed' ? 'default' : 'outline'}>{s.status}</Badge>
        </div>
      ))}
    </CardContent>
  );
};
