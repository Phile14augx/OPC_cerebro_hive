'use client';

export function OverviewDashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Evaluation Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">High-level metrics across all evaluation runs.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border border-border bg-muted/5 rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Safety</div>
          <div className="text-2xl font-bold text-green-500">98.4%</div>
        </div>
        <div className="border border-border bg-muted/5 rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Grounding</div>
          <div className="text-2xl font-bold text-yellow-500">92.1%</div>
        </div>
        <div className="border border-border bg-muted/5 rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hallucination Rate</div>
          <div className="text-2xl font-bold text-red-400">1.8%</div>
        </div>
        <div className="border border-border bg-muted/5 rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Runs (30d)</div>
          <div className="text-2xl font-bold text-primary">1,245</div>
        </div>
      </div>
      
      <div className="border border-border bg-muted/5 rounded-xl h-64 flex items-center justify-center text-muted-foreground text-sm">
        [Trend Chart Placeholder: Quality vs Latency over Time]
      </div>
    </div>
  );
}
