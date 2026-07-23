'use client';

import { useTraceDetails } from '@/src/hooks/useTelemetry';
import { useAnalyticsStore } from '@/src/store/useAnalyticsStore';
import { X } from 'lucide-react';

export function TraceDetails() {
  const { selectedTraceId, setSelectedTraceId } = useAnalyticsStore();
  const { data: details, isLoading } = useTraceDetails(selectedTraceId);

  if (!selectedTraceId) return null;

  return (
    <div className="w-1/2 flex flex-col h-full bg-card border-l border-border shadow-xl absolute right-0 top-0 z-50">
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-muted/5 shrink-0">
        <div>
          <h2 className="font-semibold text-sm">Trace: {selectedTraceId}</h2>
          <div className="text-[10px] text-muted-foreground font-mono">{details?.summary.endpoint}</div>
        </div>
        <button onClick={() => setSelectedTraceId(null)} className="p-1 hover:bg-muted rounded text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading || !details ? (
          <div className="text-sm text-muted-foreground">Loading trace details...</div>
        ) : (
          <div className="space-y-6">
            
            <div className="grid grid-cols-3 gap-4 border-b border-border pb-6">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Total Duration</div>
                <div className="font-mono text-sm">{details.summary.durationMs}ms</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Total Cost</div>
                <div className="font-mono text-sm">${details.summary.costUsd.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Tokens</div>
                <div className="font-mono text-sm">{details.summary.tokens.total}</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Span Tree</h3>
              <div className="space-y-1">
                {details.spans.map((span, index) => {
                  const depth = span.parentId === null ? 0 : details.spans.findIndex(s => s.id === span.parentId) !== -1 ? 1 : 2; // Simple mock depth calculation
                  const percentage = (span.durationMs / details.summary.durationMs) * 100;
                  
                  return (
                    <div key={span.id} className="text-xs group hover:bg-muted/30 p-1.5 rounded flex items-center relative">
                      <div className="flex-1 flex items-center" style={{ paddingLeft: \`\${depth * 16}px\` }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2"></span>
                        <div className="flex flex-col">
                          <span className="font-medium truncate">{span.name}</span>
                          <span className="text-[9px] text-muted-foreground">{span.service}</span>
                        </div>
                      </div>
                      <div className="w-32 flex items-center justify-end font-mono text-muted-foreground">
                        {span.durationMs}ms
                      </div>
                      
                      {/* Gantt Bar Mock */}
                      <div className="absolute left-0 bottom-0 h-0.5 bg-primary/20 rounded-full w-full opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="h-full bg-primary rounded-full" style={{ width: \`\${percentage}%\`, marginLeft: \`\${depth * 5}%\` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="border border-border rounded-lg p-4 bg-muted/5 mt-4">
               <h3 className="text-sm font-semibold mb-3">LLM Generation Details</h3>
               <div className="space-y-2 text-xs">
                 <div className="flex justify-between border-b border-border pb-1">
                   <span className="text-muted-foreground">Provider</span>
                   <span>{details.summary.provider}</span>
                 </div>
                 <div className="flex justify-between border-b border-border pb-1">
                   <span className="text-muted-foreground">Model</span>
                   <span>{details.summary.model}</span>
                 </div>
                 <div className="flex justify-between border-b border-border pb-1">
                   <span className="text-muted-foreground">TTFT</span>
                   <span className="font-mono">400ms</span>
                 </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
