"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart2, Code, BookOpen } from "lucide-react";

type Tab = "query" | "metrics" | "catalog";

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

const SAMPLE_QUERIES = [
  "SELECT agent_slug, COUNT(*) AS runs, AVG(latency_ms) AS avg_latency\nFROM agent_performance\nWHERE date >= CURRENT_DATE - INTERVAL '7' DAY\nGROUP BY agent_slug\nORDER BY runs DESC\nLIMIT 10",
  "SELECT fiscal_year, SUM(amount) AS revenue\nFROM finance_facts\nWHERE account_type = 'revenue'\nGROUP BY fiscal_year",
  "SELECT metric, AVG(value) AS avg_value, STDDEV(value) AS stddev\nFROM agent_metrics_agg\nWHERE date = CURRENT_DATE\nGROUP BY metric",
];

const MOCK_RESULTS: Record<number, object[]> = {
  0: [
    { agent_slug: "finance-analyst-v1", runs: 4821, avg_latency: 1240 },
    { agent_slug: "hr-copilot-v2", runs: 2193, avg_latency: 890 },
    { agent_slug: "compliance-monitor", runs: 987, avg_latency: 2100 },
  ],
  1: [
    { fiscal_year: 2024, revenue: 4200000 },
    { fiscal_year: 2025, revenue: 6800000 },
    { fiscal_year: 2026, revenue: 3900000 },
  ],
  2: [
    { metric: "tokens_per_run", avg_value: 3841, stddev: 921 },
    { metric: "latency_ms", avg_value: 1182, stddev: 440 },
    { metric: "tool_calls_per_run", avg_value: 4.2, stddev: 1.8 },
  ],
};

const METRICS = [
  { name: "total_agent_runs", type: "count", definition: "COUNT(*) FROM agent_performance", owner: "platform-team" },
  { name: "p99_agent_latency", type: "percentile", definition: "PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) FROM agent_performance", owner: "platform-team" },
  { name: "monthly_active_agents", type: "count_distinct", definition: "COUNT(DISTINCT agent_slug) FROM agent_performance WHERE date >= DATE_TRUNC('month', CURRENT_DATE)", owner: "platform-team" },
  { name: "revenue_recognition", type: "sum", definition: "SUM(amount) FROM finance_facts WHERE account_type = 'revenue'", owner: "finance-team" },
  { name: "compliance_posture_score", type: "average", definition: "AVG(score) FROM compliance_checks WHERE date = CURRENT_DATE", owner: "compliance-team" },
];

const CATALOG_TABLES = [
  { schema: "platform", table: "agent_performance", columns: 12, description: "Per-run agent metrics — latency, tokens, tool calls" },
  { schema: "platform", table: "agent_metrics_agg", columns: 6, description: "Aggregated agent metrics by date and metric type" },
  { schema: "finance", table: "finance_facts", columns: 18, description: "Double-entry accounting fact table" },
  { schema: "lake", table: "cleaned_events", columns: 24, description: "Silver zone cleaned platform events" },
  { schema: "lake", table: "raw_events", columns: 31, description: "Bronze zone raw event stream" },
];

function QueryPanel() {
  const [sql, setSql] = useState(SAMPLE_QUERIES[0]);
  const [results, setResults] = useState<object[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const run = () => {
    setBusy(true);
    const start = Date.now();
    setTimeout(() => {
      const idx = SAMPLE_QUERIES.indexOf(sql);
      setResults(MOCK_RESULTS[idx] ?? [{ info: "Query executed — no matching mock result" }]);
      setElapsed(Date.now() - start);
      setBusy(false);
    }, 600 + Math.random() * 800);
  };

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">HiveAnalytics exposes a Trino SQL interface over HiveLake and all platform tables. Query petabytes of Iceberg data with standard SQL. Results are materialized and cached via the dbt semantic layer.</p>
      <div className="flex gap-2 flex-wrap">
        {SAMPLE_QUERIES.map((q, i) => (
          <button key={i} onClick={() => { setSql(q); setResults(null); }} className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${sql === q ? "border-primary-accent text-primary-accent bg-primary-accent/10" : "border-border text-text-secondary hover:text-text-primary"}`}>Sample {i + 1}</button>
        ))}
      </div>
      <textarea className={`${inputCls} min-h-[140px] font-mono text-xs`} value={sql} onChange={e => { setSql(e.target.value); setResults(null); }} spellCheck={false} />
      <button onClick={run} disabled={busy} className={`inline-flex items-center gap-1.5 ${btnPrimary}`}>{busy ? "Running…" : "▶ Run query"}</button>
      {results && (
        <div>
          {elapsed !== null && <p className="mb-2 text-xs text-text-secondary">{results.length} rows · {elapsed}ms</p>}
          <div className="overflow-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="border-b border-border bg-surface-elevated/40">
                <tr>{Object.keys(results[0] ?? {}).map(k => <th key={k} className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-text-secondary">{k}</th>)}</tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                    {Object.values(row as Record<string, unknown>).map((v, j) => <td key={j} className="px-3 py-2 text-text-primary">{typeof v === "number" ? v.toLocaleString() : String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricsPanel() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">The dbt semantic layer enforces a single definition for every business metric. No more "whose revenue number is right?" — every team queries the same certified metric definitions.</p>
      <div className="space-y-2">
        {METRICS.map(m => (
          <div key={m.name} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-semibold text-text-primary">{m.name}</span>
              <span className="rounded-full border border-primary-accent/40 bg-primary-accent/10 px-2 py-0.5 text-xs font-semibold text-primary-accent">{m.type}</span>
            </div>
            <p className="mt-1 font-mono text-xs text-text-secondary">{m.definition}</p>
            <p className="mt-0.5 text-xs text-text-secondary">owner: {m.owner}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogPanel() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">The data catalog lists all queryable tables across HiveLake zones and platform schemas. Every table is documented, column-counted, and tagged with its owning team.</p>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-elevated/40">
            <tr>{["Schema", "Table", "Columns", "Description"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr>
          </thead>
          <tbody>
            {CATALOG_TABLES.map(t => (
              <tr key={t.table} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                <td className="px-3 py-2 font-mono text-xs text-primary-accent">{t.schema}</td>
                <td className="px-3 py-2 font-mono font-semibold text-text-primary">{t.table}</td>
                <td className="px-3 py-2 text-text-secondary">{t.columns}</td>
                <td className="px-3 py-2 text-text-secondary">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["query", "SQL Query", Code],
  ["metrics", "Metric Definitions", BarChart2],
  ["catalog", "Data Catalog", BookOpen],
];

export default function HiveAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("query");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveAnalytics™ · Tier 2</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Trino SQL analytics — unified metrics, semantic layer, data catalog</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveAnalytics provides a single SQL interface over all platform data. Query HiveLake tables, platform event streams, and business facts with Trino. The dbt semantic layer enforces single certified metric definitions across every team.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "query" && <QueryPanel />}
      {tab === "metrics" && <MetricsPanel />}
      {tab === "catalog" && <CatalogPanel />}
    </main>
  );
}
