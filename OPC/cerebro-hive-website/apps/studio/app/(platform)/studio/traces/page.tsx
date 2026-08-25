"use client";

import React, { useState, useEffect } from "react";
import { SearchBar }   from "@/components/platform/SearchBar";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { MetricTile }  from "@/components/platform/MetricTile";
import { useTraces }   from "@/lib/platform/hooks";
import { platformApi } from "@/lib/platform/api-client";
import type { TempoTrace } from "@/lib/platform/api-client";

function nanoToMs(nano: string): number {
  return Math.round(Number(BigInt(nano) / 1_000_000n));
}

interface FlatSpan {
  spanId: string; parentSpanId: string | null;
  name: string; service: string;
  startMs: number; durationMs: number; isError: boolean;
}

interface BatchData {
  resource?: { attributes?: { key: string; value: { stringValue?: string } }[] };
  scopeSpans?: { spans?: { spanId: string; parentSpanId?: string; name: string; startTimeUnixNano: string; endTimeUnixNano: string; status?: { code?: number } }[] }[];
}

function extractSpans(raw: { batches?: BatchData[] }): FlatSpan[] {
  const flat: FlatSpan[] = [];
  for (const batch of raw.batches ?? []) {
    const service = batch.resource?.attributes?.find(a => a.key === "service.name")?.value.stringValue ?? "unknown";
    for (const scope of batch.scopeSpans ?? []) {
      for (const span of scope.spans ?? []) {
        const startMs = nanoToMs(span.startTimeUnixNano);
        flat.push({ spanId: span.spanId, parentSpanId: span.parentSpanId ?? null, name: span.name, service, startMs, durationMs: nanoToMs(span.endTimeUnixNano) - startMs, isError: span.status?.code === 2 });
      }
    }
  }
  return flat.sort((a, b) => a.startMs - b.startMs);
}

function WaterfallBar({ span, totalDuration, startOffset }: { span: FlatSpan; totalDuration: number; startOffset: number }) {
  const left  = totalDuration > 0 ? (startOffset    / totalDuration) * 100 : 0;
  const width = totalDuration > 0 ? (span.durationMs / totalDuration) * 100 : 5;
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-56 shrink-0 overflow-hidden">
        <p className="truncate text-xs text-neutral-300">{span.name}</p>
        <p className="text-xs text-neutral-600">{span.service}</p>
      </div>
      <div className="relative flex-1 h-5">
        <div className="absolute h-5 rounded" style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%`, background: span.isError ? "#ef4444" : "#6366f1", opacity: 0.85 }} />
      </div>
      <div className="w-20 shrink-0 text-right"><span className="text-xs text-neutral-500">{span.durationMs.toFixed(1)}ms</span></div>
    </div>
  );
}

function TraceDetail({ trace, onClose }: { trace: TempoTrace; onClose: () => void }) {
  const [spans, setSpans]     = useState<FlatSpan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const raw = await platformApi.traces.get(trace.traceID) as { batches?: BatchData[] };
        if (!cancelled) { setSpans(extractSpans(raw)); setLoading(false); }
      } catch (err) {
        if (!cancelled) { setError(err instanceof Error ? err.message : "Failed"); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [trace.traceID]);

  const traceStart = spans.length > 0 ? Math.min(...spans.map(s => s.startMs)) : 0;
  const services   = [...new Set(spans.map(s => s.service))];
  const hasError   = spans.some(s => s.isError);

  return (
    <div className="rounded-xl border border-indigo-900 bg-neutral-950 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-neutral-500">Trace {trace.traceID}</p>
          <p className="mt-0.5 font-medium text-white">{trace.rootTraceName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <span>{spans.length} spans</span>
            <span>{trace.durationMs.toFixed(1)}ms total</span>
            <span>{new Date(nanoToMs(trace.startTimeUnixNano)).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={hasError ? "FAILED" : "COMPLETED"} />
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg>
          </button>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {services.map(svc => <span key={svc} className="rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-mono text-neutral-400">{svc}</span>)}
      </div>
      {loading ? <div className="py-8 text-center text-sm text-neutral-500">Loading spans…</div>
       : error   ? <div className="py-8 text-center text-sm text-red-400">{error}</div>
       : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="min-w-[600px]">
            <div className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <span className="w-56 shrink-0">Span</span><span className="flex-1">Timeline</span><span className="w-20 shrink-0 text-right">Duration</span>
            </div>
            {spans.map(span => <WaterfallBar key={span.spanId} span={span} totalDuration={trace.durationMs} startOffset={span.startMs - traceStart} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TracesPage() {
  const [search, setSearch]   = useState("");
  const [service, setService] = useState("");
  const [selected, setSelected] = useState<TempoTrace | null>(null);

  const { result, loading, error, refresh } = useTraces({ serviceName: service || undefined, limit: 100 });
  const traces = (result?.traces ?? []).filter(t =>
    !search || t.rootTraceName.toLowerCase().includes(search.toLowerCase()) || t.traceID.includes(search)
  );

  const avgDuration = traces.length > 0 ? (traces.reduce((s, t) => s + t.durationMs, 0) / traces.length).toFixed(0) : "—";
  const p99Duration = traces.length > 0 ? String([...traces].sort((a, b) => b.durationMs - a.durationMs)[0]?.durationMs?.toFixed(0) ?? "—") : "—";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Traces</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Distributed tracing via OpenTelemetry + Tempo</p>
        </div>
        <button onClick={() => void refresh()} className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300 transition-colors">Refresh</button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="Total Traces"  value={loading ? "…" : traces.length} />
        <MetricTile label="Inspected"     value={loading ? "…" : (result?.metrics.inspectedTraces ?? 0)} />
        <MetricTile label="Avg Duration"  value={loading ? "…" : `${avgDuration}ms`} />
        <MetricTile label="P99 Duration"  value={loading ? "…" : `${p99Duration}ms`} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by operation or trace ID…" className="flex-1" />
        <input value={service} onChange={e => setService(e.target.value)} placeholder="Filter by service…"
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-400 placeholder-neutral-600 outline-none focus:border-indigo-500 w-48" />
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          Failed to load traces: {error} — <button onClick={() => void refresh()} className="underline">retry</button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-neutral-800 bg-neutral-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          <span>Operation</span><span>Service</span><span>Duration</span><span>Time</span>
        </div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-neutral-800/60 px-4 py-3 last:border-0">
              {[2, 1, 1, 1].map((w, j) => <div key={j} className={`h-4 w-${w === 2 ? "2/3" : "12"} animate-pulse rounded bg-neutral-800`} />)}
            </div>
          ))
        ) : traces.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-500">No traces found. Ensure Tempo is reachable.</p>
          </div>
        ) : traces.map(trace => (
          <React.Fragment key={trace.traceID}>
            <div onClick={() => setSelected(selected?.traceID === trace.traceID ? null : trace)}
              className={`grid cursor-pointer grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-neutral-800/60 px-4 py-3 transition-colors hover:bg-neutral-800/40 last:border-0 ${selected?.traceID === trace.traceID ? "bg-indigo-950/20" : ""}`}>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{trace.rootTraceName}</p>
                <code className="text-xs text-neutral-600">{trace.traceID.slice(0, 16)}</code>
              </div>
              <span className="flex items-center font-mono text-xs text-neutral-500">{trace.rootServiceName}</span>
              <span className="flex items-center text-sm font-mono text-neutral-400">{trace.durationMs}ms</span>
              <span className="flex items-center text-xs text-neutral-600">
                {new Date(nanoToMs(trace.startTimeUnixNano)).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {selected?.traceID === trace.traceID && (
              <div className="border-b border-neutral-800/60 bg-neutral-950/80 px-4 py-4">
                <TraceDetail trace={trace} onClose={() => setSelected(null)} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
