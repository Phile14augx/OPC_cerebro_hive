"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { api, checkOnline, KEY, formatValue, type Metric, type Dashboard, type Widget, type Alert, type InsightCard } from "./lib";

const STATUS_COLOR: Record<string, string> = {
  healthy: "border-primary-accent/40",
  warning: "border-amber-400/50",
  critical: "border-red-500/60",
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp size={14} className="text-emerald-400" />;
  if (trend === "down") return <TrendingDown size={14} className="text-red-400" />;
  return <Minus size={14} className="text-text-secondary" />;
}

function metricsByKey(metrics: Metric[]) { return Object.fromEntries(metrics.map(m => [m.key, m])); }

function KpiWidget({ widget, metrics }: { widget: Widget; metrics: Record<string, Metric> }) {
  const m = metrics[widget.metricKeys[0] ?? ""];
  if (!m) return null;
  return (
    <div className={`rounded-xl border ${STATUS_COLOR[m.status]} bg-surface/40 p-4`}>
      <div className="text-xs uppercase tracking-wider text-text-secondary">{m.name}</div>
      <div className="mt-1 flex items-center gap-2 text-2xl font-semibold text-text-primary">
        {formatValue(m.unit, m.value)}
        <TrendIcon trend={m.trend} />
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-text-secondary">{m.source}</div>
    </div>
  );
}

function BarWidget({ widget, metrics }: { widget: Widget; metrics: Record<string, Metric> }) {
  const m = metrics[widget.metricKeys[0] ?? ""];
  if (!m || m.history.length === 0) return null;
  const max = Math.max(...m.history, 1);
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <div className="text-sm font-semibold text-text-primary">{widget.title}</div>
      <div className="mt-3 flex h-24 items-end gap-1.5">
        {m.history.map((v, i) => (
          <div key={i} className="flex-1 rounded-t bg-primary-accent/60" style={{ height: `${Math.max(4, (v / max) * 100)}%` }} title={String(v)} />
        ))}
      </div>
    </div>
  );
}

function LineWidget({ widget, metrics }: { widget: Widget; metrics: Record<string, Metric> }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <div className="text-sm font-semibold text-text-primary">{widget.title}</div>
      <div className="mt-3 space-y-3">
        {widget.metricKeys.map(key => {
          const m = metrics[key];
          if (!m || m.history.length < 2) return null;
          const max = Math.max(...m.history, 1);
          const points = m.history.map((v, i) => `${(i / (m.history.length - 1)) * 100},${30 - (v / max) * 28}`).join(" ");
          return (
            <div key={key}>
              <div className="text-xs text-text-secondary">{m.name}</div>
              <svg viewBox="0 0 100 30" className="mt-1 h-8 w-full" preserveAspectRatio="none">
                <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-accent" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PieWidget({ widget, metrics }: { widget: Widget; metrics: Record<string, Metric> }) {
  const parts = widget.metricKeys.map(k => metrics[k]).filter((m): m is Metric => !!m);
  const total = parts.reduce((s, m) => s + Math.max(m.value, 0), 0) || 1;
  let acc = 0;
  const colors = ["#7c5cff", "#3ec6ff", "#ffb020", "#34d399", "#f472b6"];
  const stops = parts.map((m, i) => {
    const pct = (Math.max(m.value, 0) / total) * 100;
    const stop = `${colors[i % colors.length]} ${acc}% ${acc + pct}%`;
    acc += pct;
    return stop;
  });
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <div className="text-sm font-semibold text-text-primary">{widget.title}</div>
      <div className="mt-3 flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(", ")})` }} />
        <div className="space-y-1 text-xs">
          {parts.map((m, i) => (
            <div key={m.key} className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: colors[i % colors.length] }} />
              <span className="text-text-secondary">{m.name}: {formatValue(m.unit, m.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableWidget({ widget, metrics }: { widget: Widget; metrics: Record<string, Metric> }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4 md:col-span-2 lg:col-span-3">
      <div className="text-sm font-semibold text-text-primary">{widget.title}</div>
      <table className="mt-3 w-full text-left text-xs">
        <thead className="text-text-secondary">
          <tr><th className="pb-2">Metric</th><th className="pb-2">Value</th><th className="pb-2">Trend</th><th className="pb-2">Status</th><th className="pb-2">Source</th></tr>
        </thead>
        <tbody>
          {widget.metricKeys.map(k => {
            const m = metrics[k];
            if (!m) return null;
            return (
              <tr key={k} className="border-t border-border/60">
                <td className="py-1.5 text-text-primary">{m.name}</td>
                <td className="py-1.5 text-text-primary">{formatValue(m.unit, m.value)}</td>
                <td className="py-1.5"><TrendIcon trend={m.trend} /></td>
                <td className="py-1.5 capitalize text-text-secondary">{m.status}</td>
                <td className="py-1.5 text-text-secondary">{m.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function CerebroInsightPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      const [m, d, a, i] = await Promise.all([
        api<{ metrics: Metric[] }>("/v1/cerebroinsight/metrics"),
        api<{ dashboards: Dashboard[] }>("/v1/cerebroinsight/dashboards"),
        api<{ alerts: Alert[] }>("/v1/cerebroinsight/alerts"),
        api<{ insights: InsightCard[] }>("/v1/cerebroinsight/insights"),
      ]);
      setMetrics(m.metrics);
      setDashboard(d.dashboards[0] ?? null);
      setAlerts(a.alerts);
      setInsights(i.insights);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const runRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await api("/v1/cerebroinsight/refresh", { method: "POST" });
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setRefreshing(false); }
  }, [refresh]);

  const byKey = metricsByKey(metrics);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroInsight™ — Phase 1: Analytics Foundation</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Executive Intelligence, not another BI dashboard</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        A metric engine, dashboard builder, alert engine, and AI insight narratives built directly on
        live CerebroHive data — HiveForge cloud cost and resources, CerebroStudio AI activity,
        CerebroSwarm directives — plus a small mock business dataset standing in for ERP/CRM until
        real connectors exist.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
          <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
        </div>
        <button onClick={() => void runRefresh()} disabled={refreshing || !online || !KEY} className="inline-flex items-center gap-1.5 rounded-lg border border-primary-accent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-accent disabled:opacity-40">
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Refreshing…" : "Refresh metrics"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {alerts.length > 0 && (
        <section className="mt-8 space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Active alerts</h2>
          {alerts.slice(0, 5).map(a => (
            <div key={a.id} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${a.severity === "critical" ? "border-red-500/50 bg-red-500/5 text-red-300" : "border-amber-400/50 bg-amber-400/5 text-amber-300"}`}>
              <AlertTriangle size={14} /> {a.message}
            </div>
          ))}
        </section>
      )}

      {insights.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">AI insight cards</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {insights.map(i => (
              <div key={i.id} className="rounded-xl border border-primary-accent/40 bg-primary-accent/5 p-4 text-sm text-text-primary">{i.narrative}</div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{dashboard?.name ?? "Executive Overview"}</h2>
        {metrics.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">No metrics yet — hit &ldquo;Refresh metrics&rdquo; above to pull live data from HiveForge, CerebroStudio, and CerebroSwarm.</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {dashboard?.widgets.slice().sort((a, b) => a.order - b.order).map(w => {
              if (w.type === "kpi") return <KpiWidget key={w.id} widget={w} metrics={byKey} />;
              if (w.type === "bar") return <BarWidget key={w.id} widget={w} metrics={byKey} />;
              if (w.type === "line") return <LineWidget key={w.id} widget={w} metrics={byKey} />;
              if (w.type === "pie") return <PieWidget key={w.id} widget={w} metrics={byKey} />;
              return <TableWidget key={w.id} widget={w} metrics={byKey} />;
            })}
          </div>
        )}
      </section>
    </main>
  );
}
