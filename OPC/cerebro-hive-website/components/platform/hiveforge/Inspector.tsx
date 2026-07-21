"use client";

import { useEffect, useState } from "react";
import { eventBus } from "../../../app/platform/hiveforge/core/events/EventBus";
import { DomainEvent } from "../../../app/platform/hiveforge/core/contracts/event";

export function Inspector() {
  const [events, setEvents] = useState<DomainEvent[]>([]);

  useEffect(() => {
    // Listen to all activity globally
    const unsubscribe = eventBus.subscribeAll((event) => {
      setEvents((prev) => [event as DomainEvent, ...prev].slice(0, 50));
    });

    return () => unsubscribe();
  }, []);

  return (
    <aside className="w-80 border-l border-border bg-surface/30 flex flex-col h-full overflow-y-auto hidden xl:flex shrink-0">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="font-semibold text-sm text-text-primary">Inspector</div>
        <div className="text-xs text-primary-accent bg-primary-accent/10 px-2 py-0.5 rounded">AI Copilot Active</div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Context panel */}
        <div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Current Context</div>
          <div className="text-sm text-text-primary bg-surface/50 p-3 rounded-lg border border-border">
            Workspace: <span className="font-mono text-primary-accent">Data Platform</span><br/>
            Project: <span className="font-mono text-primary-accent">Core</span><br/>
            Resource: <span className="text-text-secondary">None selected</span>
          </div>
        </div>

        {/* Global Activity Stream */}
        <div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex justify-between">
            <span>Activity Stream</span>
            <span className="text-primary-accent">{events.length}</span>
          </div>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-xs text-text-secondary italic">No recent activity.</div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="text-xs border-l-2 border-primary-accent/50 pl-2 py-1">
                  <div className="text-text-primary font-medium">{evt.type}</div>
                  <div className="text-text-secondary flex justify-between mt-1">
                    <span>{evt.source}</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
