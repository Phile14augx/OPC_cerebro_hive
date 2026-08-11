
import React, { useEffect, useState } from 'react';
import { PlatformEventBus } from '@cerebro/events';
import { CardContent } from '@cerebro/ui';

export const LiveExecutionTimelineWidget = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const unsub = PlatformEventBus.subscribe('telemetry:event' as any, (event: any) => {
      // Filter for Swarm/Agent lifecycle events
      const swarmTypes = ['REASONING_STARTED', 'TOOL_CALLED', 'MEMORY_RETRIEVED', 'EXECUTION_FINISHED'];
      if (swarmTypes.includes(event.type)) {
        setEvents(prev => [...prev, event].slice(-10)); // Keep last 10
      }
    });
    return unsub;
  }, []);

  return (
    <CardContent className="flex flex-col gap-2 py-4">
      <h3 className="font-semibold text-sm mb-2">Live Agent Reasoning</h3>
      {events.map((e, i) => (
        <div key={i} className="flex gap-2 text-xs">
          <span className="text-[var(--color-text-muted)]">{new Date(e.timestamp).toLocaleTimeString()}</span>
          <span className="font-medium text-[var(--color-text-primary)]">{e.type}</span>
          <span className="text-[var(--color-text-secondary)]">{JSON.stringify(e.details)}</span>
        </div>
      ))}
      {events.length === 0 && <p className="text-xs text-[var(--color-text-muted)]">Awaiting agent execution...</p>}
    </CardContent>
  );
};
