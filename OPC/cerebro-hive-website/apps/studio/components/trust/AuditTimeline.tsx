'use client';
import React from 'react';
import { useAuditStore } from '@/src/store/trust/useAuditStore';
import { Activity } from 'lucide-react';

export function AuditTimeline() {
  const { events, isLoading } = useAuditStore();

  if (isLoading || !events) {
    return <div className="h-64 border border-border bg-muted/10 animate-pulse rounded-lg" />;
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-purple-500" />
          <h3 className="font-semibold text-sm">Live Activity Feed</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="relative border-l border-border ml-3 space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative pl-6">
              <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary/20 border border-primary" />
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-muted-foreground">{event.timestamp}</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary/70 bg-primary/10 px-2 py-0.5 rounded">{event.category}</span>
              </div>
              <p className="text-sm font-medium">{event.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{event.user}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
