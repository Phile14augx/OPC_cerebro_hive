'use client';

import { useTelemetryOverview } from '@/src/hooks/useTelemetry';
import { Activity, Clock, Zap, DollarSign, AlertCircle, Database } from 'lucide-react';

export function OverviewDashboard() {
  const { data: metrics, isLoading } = useTelemetryOverview();

  if (isLoading || !metrics) {
    return <div className="p-8 text-muted-foreground">Loading overview...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            System Live Overview
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time operational health of the AI Gateway and Agent Runtime.</p>
        </div>
        <div className="text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-full bg-muted/10">
          Last updated: Just now
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* RPM */}
        <div className="border border-border bg-card rounded-xl p-4 flex flex-col">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"><Activity className="w-3.5 h-3.5" /> Requests / Min</span>
          <span className="text-2xl font-bold">{metrics.rpm}</span>
          <span className="text-[10px] text-green-500 mt-1">↑ 12% vs prev hour</span>
        </div>
        
        {/* Latency */}
        <div className="border border-border bg-card rounded-xl p-4 flex flex-col">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"><Clock className="w-3.5 h-3.5" /> Avg Latency</span>
          <span className="text-2xl font-bold">{metrics.avgLatencyMs}ms</span>
          <span className="text-[10px] text-muted-foreground mt-1">stable</span>
        </div>

        {/* TTFT */}
        <div className="border border-border bg-card rounded-xl p-4 flex flex-col">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"><Zap className="w-3.5 h-3.5" /> TTFT (Time To First Token)</span>
          <span className="text-2xl font-bold">{metrics.avgTtftMs}ms</span>
        </div>

        {/* Cost */}
        <div className="border border-border bg-card rounded-xl p-4 flex flex-col">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"><DollarSign className="w-3.5 h-3.5" /> Est. Cost (Today)</span>
          <span className="text-2xl font-bold">${metrics.totalCostUsd.toFixed(2)}</span>
        </div>

        {/* Error Rate */}
        <div className="border border-border bg-card rounded-xl p-4 flex flex-col">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"><AlertCircle className="w-3.5 h-3.5" /> Error Rate</span>
          <span className="text-2xl font-bold text-red-400">{(metrics.errorRate * 100).toFixed(2)}%</span>
        </div>

        {/* Cache Hit */}
        <div className="border border-border bg-card rounded-xl p-4 flex flex-col">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"><Database className="w-3.5 h-3.5" /> Cache Hit Rate</span>
          <span className="text-2xl font-bold">{(metrics.cacheHitRate * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-border bg-card rounded-xl p-5 h-72 flex flex-col">
          <h3 className="font-semibold text-sm mb-4">Requests & Tokens Over Time</h3>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs bg-muted/5 border border-dashed border-border rounded">
            [Tremor/ECharts Time-Series Mock]
          </div>
        </div>
        <div className="border border-border bg-card rounded-xl p-5 h-72 flex flex-col">
          <h3 className="font-semibold text-sm mb-4">Cost by Provider</h3>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs bg-muted/5 border border-dashed border-border rounded">
            [Tremor/ECharts Donut Mock]
          </div>
        </div>
      </div>
    </div>
  );
}
