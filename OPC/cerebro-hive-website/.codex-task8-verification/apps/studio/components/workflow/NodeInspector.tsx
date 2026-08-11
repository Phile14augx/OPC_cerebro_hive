'use client';

import React from 'react';
import { useWorkflowStudioStore } from '@/src/store/useWorkflowStudioStore';

export function NodeInspector({ workflowId }: { workflowId: string }) {
  const { selectedNodeId } = useWorkflowStudioStore();

  if (!selectedNodeId) {
    return (
      <div className="flex flex-col h-full bg-muted/5 border-l border-border w-80 p-6">
        <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4">Node Inspector</h2>
        <div className="text-sm text-muted-foreground">Select a node on the canvas to configure it.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/5 border-l border-border w-80">
      <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0 bg-muted/10">
        Node: {selectedNodeId}
      </div>
      <div className="p-4 space-y-6 overflow-auto">
        <section>
          <h3 className="text-sm font-semibold mb-2">Configuration</h3>
          <div className="text-xs text-muted-foreground mb-4">Configure properties specific to this node type.</div>
          
          <label className="block text-xs font-medium mb-1">Node Label</label>
          <input type="text" className="w-full bg-background border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary mb-4" defaultValue={selectedNodeId} />
          
          <label className="block text-xs font-medium mb-1">Retry Policy</label>
          <select className="w-full bg-background border border-border rounded px-3 py-2 text-sm outline-none mb-4">
            <option>Default (3 retries)</option>
            <option>No Retries</option>
            <option>Exponential Backoff</option>
          </select>
          
          <label className="block text-xs font-medium mb-1">Timeout (ms)</label>
          <input type="number" className="w-full bg-background border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary mb-4" defaultValue={30000} />
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-2">Input Mapping</h3>
          <div className="p-3 bg-background border border-border rounded text-xs text-muted-foreground text-center">
            Define variable mappings from previous nodes.
          </div>
        </section>
        
        <section>
          <h3 className="text-sm font-semibold mb-2">Observability</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border pb-1">
              <span className="text-muted-foreground">Avg Latency</span>
              <span>1.2s</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="text-green-500">99.8%</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
