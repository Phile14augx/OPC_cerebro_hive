"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, AlertTriangle, BarChart2, Zap } from "lucide-react";

const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: KEY ? { Authorization: `Bearer ${KEY}` } : {} });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

type Tab = "overview" | "traces" | "alerts";

const ALERTS = [
  { id: "a1", severity: "warning", title: "P99 latency spike", message: "finance-analyst-v1 P99 latency exceeded 3000ms threshold for 5 minutes.", ts: "2026-07-25 05:42", status: "active" },
  { id: "a2", severity: "info", title: "High token spend", message: "Token budget 78% consumed for current billing period.", ts: "2026-07-25 04:00", status: "active" },
  { id: "a3", severity: "critical", title: "Vector index degraded", message: "HiveVector ANN query latency 4x baseline. Possible index fragmentation.", ts: "2026-07-24 22:15", status: "resolved" },
];

function OverviewPanel() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    try {
      const s = await api<Record<string, unknown>>("/observability/summary");
      setSummary(s); setOnline(true);
    } catch { setOnline(false); }
  }, []);

  useEffect(() => { void refresh(); const id = setInterval(refresh, 8000); return () => clearInterval(id); }, [refresh]);

  const kpis = summary ? Object.entries(summary) : [
    ["total_agent_runs", "24,891"], ["total_tokens", "182,400,000"], ["avg_latency_ms", "1,182"],
    ["error_rate", "0.3%"], ["active_agents", "7"], ["active_workflows", "3"],
  ];

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-border"}`} />
        <span className="text-text-secondary">{online === null ? "Connecting…" : online ? "Live telemetry" : "Showing demo data"}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(([k, v]) => (
          <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{String(k).replace(/_/g, " ")}</p>
            <p className="mt-2 text-2xl font-bold text-primary-accent">{String(v)}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface/40 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Telemetry pipeline</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {["Agents / Services", "→ OpenTelemetry Collector", "→ ClickHouse", "→ HiveObservatory"].map((s, i) => (
            <span key={i} className={i % 2 === 0 ? "rounded-md border border-primary-accent/40 bg-primary-accent/10 px-2 py-1 font-semibold text-primary-accent" : "text-text-secondary font-mono"}>{s}</span>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-secondary">All platform traces, metrics, and events flow through OpenTelemetry collectors into ClickHouse for high-cardinality analytics. HiveObservatory provides the query interface, alerting engine, and AI anomaly detection layer on top.</p>
      </div>
    </div>
  );
}

function TracesPanel() {
  const [traces, setTraces] = useState<Record<string, unknown>[]>([]);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    api<Record<string, unknown>[]>("/observability/traces").then(t => { setTraces(t); setOnline(true); }).catch(() => setOnline(false));
  }, []);

  const demo = [
    { trace_id: "tr-8f2a", agent_slug: "finance-analyst-v1", steps: 8, tokens_in: 4821, tokens_out: 1240, latency_ms: 2100, status: "success" },
    { trace_id: "tr-9b1c", agent_slug: "hr-copilot-v2", steps: 4, tokens_in: 2100, tokens_out: 680, latency_ms: 890, status: "success" },
    { trace_id: "tr-3d7e", agent_slug: "compliance-monitor", steps: 12, tokens_in: 8400, tokens_out: 2100, latency_ms: 3400, status: "error" },
  ];

  const rows = (online && traces.length > 0 ? traces : demo) as Record<string, unknown>[];

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">{online ? "Live traces from AgentOS runtime." : "Demo traces — connect the platform for live data."} Every span includes model, token counts, latency, and tool call sequence.</p>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead className="border-b border-border bg-surface-elevated/40">
            <tr>{["Trace", "Agent", "Steps", "Tokens In", "Tokens Out", "Latency", "Status"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={i} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                <td className="px-3 py-2 font-mono text-text-secondary">{String(t.trace_id)}</td>
                <td className="px-3 py-2 font-semibold text-text-primary">{String(t.agent_slug)}</td>
                <td className="px-3 py-2 text-text-secondary">{String(t.steps)}</td>
                <td className="px-3 py-2 text-text-secondary">{Number(t.tokens_in).toLocaleString()}</td>
                <td className="px-3 py-2 text-text-secondary">{Number(t.tokens_out).toLocaleString()}</td>
                <td className="px-3 py-2 text-text-secondary">{String(t.latency_ms)}ms</td>
                <td className="px-3 py-2"><span className={`font-semibold ${String(t.status) === "success" ? "text-primary-accent" : "text-red-400"}`}>{String(t.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlertsPanel() {
  const [alerts, setAlerts] = useState(ALERTS);
  const resolve = (id: string) => setAlerts(a => a.map(al => al.id === id ? { ...al, status: "resolved" } : al));
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">AI-powered anomaly detection fires alerts when metrics deviate from learned baselines. Alerts route to Slack, PagerDuty, or any webhook target.</p>
      <div className="space-y-2">
        {alerts.map(a => (
          <div key={a.id} className={`rounded-xl border p-4 ${a.severity === "critical" ? "border-red-500/40 bg-red-500/5" : a.severity === "warning" ? "border-yellow-400/40 bg-yellow-400/5" : "border-border bg-surface/40"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase ${a.severity === "critical" ? "text-red-400" : a.severity === "warning" ? "text-yellow-400" : "text-text-secondary"}`}>{a.severity}</span>
                  <span className="font-semibold text-text-primary">{a.title}</span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">{a.message}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{a.ts}</p>
              </div>
              {a.status === "active"
                ? <button onClick={() => resolve(a.id)} className="shrink-0 rounded-md border border-primary-accent/40 px-2 py-1 text-xs text-primary-accent hover:bg-primary-accent/10 transition-colors">Resolve</button>
                : <span className="shrink-0 text-xs text-text-secondary">resolved</span>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["overview", "Overview", BarChart2],
  ["traces", "Traces", Activity],
  ["alerts", "Alerts", AlertTriangle],
];

export default function HiveObservatoryPage() {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveObservatory™ · Tier 2</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Unified observability — OpenTelemetry, ClickHouse, AI anomaly detection</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveObservatory is the telemetry hub. Every platform service and agent emits traces, metrics, and events via OpenTelemetry collectors into ClickHouse. Query petabytes of telemetry with sub-second response and set AI-powered anomaly alerts that fire before users notice.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "overview" && <OverviewPanel />}
      {tab === "traces" && <TracesPanel />}
      {tab === "alerts" && <AlertsPanel />}
    </main>
  );
}
