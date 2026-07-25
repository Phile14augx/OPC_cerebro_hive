"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, BarChart2, Zap, GitBranch } from "lucide-react";
import { api, checkOnline, type TraceOut, type MetricOut, type EventOut } from "./lib";

type Tab = "traces" | "metrics" | "events" | "summary";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

function statusColor(s: string) {
  return s === "success" || s === "completed" ? "text-primary-accent border-primary-accent/40 bg-primary-accent/10"
    : s === "error" || s === "failed" ? "text-red-400 border-red-400/40 bg-red-400/10"
    : "text-yellow-400 border-yellow-400/40 bg-yellow-400/10";
}

function TracesPanel({ online }: { online: boolean | null }) {
  const [traces, setTraces] = useState<TraceOut[]>([]);
  const refresh = useCallback(async () => {
    if (!online) return;
    try { setTraces(await api<TraceOut[]>("/observability/traces")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">Distributed traces capture every agent run — token counts, latency, step count, and final status. Use traces to identify slow or expensive agent paths and optimize prompts and tool chains.</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">{traces.length} traces</p>
        <button onClick={() => void refresh()} className={btnPrimary}>Refresh</button>
      </div>
      {traces.length === 0
        ? <p className="text-sm text-text-secondary">No traces yet. Run an agent to generate trace data.</p>
        : <div className="overflow-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="border-b border-border bg-surface-elevated/40">
                <tr>
                  {["Trace ID", "Agent", "Steps", "Tokens In", "Tokens Out", "Latency", "Status"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {traces.map(t => (
                  <tr key={t.trace_id} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                    <td className="px-3 py-2 font-mono text-text-secondary">{t.trace_id.slice(0, 8)}</td>
                    <td className="px-3 py-2 font-semibold text-text-primary">{t.agent_slug}</td>
                    <td className="px-3 py-2 text-text-secondary">{t.steps}</td>
                    <td className="px-3 py-2 text-text-secondary">{t.tokens_in.toLocaleString()}</td>
                    <td className="px-3 py-2 text-text-secondary">{t.tokens_out.toLocaleString()}</td>
                    <td className="px-3 py-2 text-text-secondary">{t.latency_ms}ms</td>
                    <td className="px-3 py-2"><span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold ${statusColor(t.status)}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
}

function MetricsPanel({ online }: { online: boolean | null }) {
  const [metrics, setMetrics] = useState<MetricOut[]>([]);
  const refresh = useCallback(async () => {
    if (!online) return;
    try { setMetrics(await api<MetricOut[]>("/observability/metrics")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">Aggregated metrics across all agents and services — token throughput, latency percentiles, success rates, and cost. All metrics are windowed and stored in ClickHouse for high-cardinality queries.</p>
      <button onClick={() => void refresh()} className={btnPrimary}>Refresh</button>
      {metrics.length === 0
        ? <p className="text-sm text-text-secondary">No metrics available yet. Metrics aggregate as the platform processes requests.</p>
        : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map(m => (
              <div key={m.metric} className="rounded-xl border border-border bg-surface/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{m.metric}</p>
                <p className="mt-2 text-2xl font-bold text-primary-accent">{m.value.toLocaleString()}<span className="ml-1 text-sm font-normal text-text-secondary">{m.unit}</span></p>
                <p className="mt-0.5 text-xs text-text-secondary">{m.window} window</p>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

function EventsPanel({ online }: { online: boolean | null }) {
  const [events, setEvents] = useState<EventOut[]>([]);
  const refresh = useCallback(async () => {
    if (!online) return;
    try { setEvents(await api<EventOut[]>("/observability/events")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">Real-time event stream from all platform services. Events are ingested via OpenTelemetry collectors and routed to ClickHouse for storage and HiveObservatory for alerting.</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">{events.length} events</p>
        <button onClick={() => void refresh()} className={btnPrimary}>Refresh</button>
      </div>
      {events.length === 0
        ? <p className="text-sm text-text-secondary">No events yet. Events appear as agents and services emit telemetry.</p>
        : <div className="space-y-2">
            {events.map(e => (
              <div key={e.event_id} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary-accent">{e.event_type}</span>
                    <span className="text-xs text-text-secondary">·</span>
                    <span className="text-xs text-text-secondary">{e.source}</span>
                  </div>
                  <span className="text-xs text-text-secondary">{new Date(e.created_at).toLocaleTimeString()}</span>
                </div>
                <pre className="mt-2 overflow-auto text-xs text-text-secondary">{JSON.stringify(e.payload, null, 2)}</pre>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

function SummaryPanel({ online }: { online: boolean | null }) {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    if (!online) return;
    api<Record<string, unknown>>("/observability/summary").then(setSummary).catch(() => { /* noop */ });
  }, [online]);

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Platform-wide observability summary — aggregated across all agents, runs, and services for the current billing window.</p>
      {summary
        ? <div className="rounded-xl border border-border bg-surface/40 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(summary).map(([k, v]) => (
                  <tr key={k} className="border-b border-border last:border-none">
                    <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary w-48">{k.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-text-primary font-mono">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        : <p className="text-sm text-text-secondary">Loading summary…</p>
      }
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["traces", "Traces", Activity],
  ["metrics", "Metrics", BarChart2],
  ["events", "Events", Zap],
  ["summary", "Summary", GitBranch],
];

export default function HiveEvaluationPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("traces");
  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveEvaluation™ · Tier 3</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">AI observability — traces, metrics, events, and platform-wide telemetry</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveEvaluation is the evaluation and observability hub. Every agent run produces distributed traces, aggregated metrics, and event streams — all stored in ClickHouse and queryable in real time for cost, quality, and performance analysis.</p>
      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === "traces" && <TracesPanel online={online} />}
      {tab === "metrics" && <MetricsPanel online={online} />}
      {tab === "events" && <EventsPanel online={online} />}
      {tab === "summary" && <SummaryPanel online={online} />}
    </main>
  );
}
