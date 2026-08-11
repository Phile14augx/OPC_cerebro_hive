'use client';

import { useTraces } from '@/src/hooks/useTelemetry';
import { useAnalyticsStore } from '@/src/store/useAnalyticsStore';

export function TraceExplorer() {
  const { data: traces, isLoading } = useTraces();
  const { setSelectedTraceId } = useAnalyticsStore();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-muted/5 shrink-0">
        <div>
          <h2 className="font-semibold">Execution Traces</h2>
          <div className="text-xs text-muted-foreground mt-0.5">Distributed traces for all AI Gateway interactions.</div>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Search Trace ID..." className="text-xs border border-border bg-background px-3 py-1.5 rounded w-64 outline-none focus:border-primary" />
          <button className="text-xs border border-border bg-background px-3 py-1.5 rounded">Filter</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading traces...</div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/10 text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Endpoint</th>
                  <th className="px-4 py-3 text-right">Duration</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3 text-right">Tokens</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {traces?.map(trace => (
                  <tr key={trace.id} onClick={() => setSelectedTraceId(trace.traceId)} className="hover:bg-muted/5 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(trace.timestamp).toLocaleTimeString()}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{trace.endpoint}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{trace.traceId}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{trace.durationMs}ms</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">{trace.model}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{trace.tokens.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">${trace.costUsd.toFixed(4)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full">{trace.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
