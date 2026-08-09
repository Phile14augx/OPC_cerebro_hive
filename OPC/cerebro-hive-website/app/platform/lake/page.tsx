"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, GitBranch, Archive } from "lucide-react";

type Tab = "zones" | "tables" | "snapshots";
type Zone = "bronze" | "silver" | "gold";
type Table = { name: string; zone: Zone; rows: number; sizeGb: number; format: string; partitions: string; lastUpdated: string };

const TABLES: Table[] = [
  { name: "raw_events", zone: "bronze", rows: 182_400_000, sizeGb: 48.2, format: "Parquet", partitions: "date/hour", lastUpdated: "2026-07-25 06:00" },
  { name: "raw_agent_traces", zone: "bronze", rows: 4_120_000, sizeGb: 3.1, format: "Parquet", partitions: "date/agent_slug", lastUpdated: "2026-07-25 06:00" },
  { name: "cleaned_events", zone: "silver", rows: 178_200_000, sizeGb: 22.7, format: "Iceberg", partitions: "date", lastUpdated: "2026-07-25 04:30" },
  { name: "agent_metrics_agg", zone: "silver", rows: 840_000, sizeGb: 0.8, format: "Iceberg", partitions: "date/metric", lastUpdated: "2026-07-25 04:00" },
  { name: "finance_facts", zone: "gold", rows: 320_000, sizeGb: 0.4, format: "Iceberg", partitions: "fiscal_year/quarter", lastUpdated: "2026-07-24 23:00" },
  { name: "agent_performance", zone: "gold", rows: 92_000, sizeGb: 0.1, format: "Iceberg", partitions: "date", lastUpdated: "2026-07-25 05:00" },
  { name: "ml_training_sets", zone: "gold", rows: 2_400_000, sizeGb: 12.4, format: "Iceberg", partitions: "model_type/version", lastUpdated: "2026-07-20 18:00" },
];

const ZONE_META: Record<Zone, { label: string; desc: string; color: string; bg: string }> = {
  bronze: { label: "Bronze — Raw ingestion", desc: "Append-only raw data as received. No transformation. Retention: 90 days.", color: "text-orange-400", bg: "border-orange-400/30 bg-orange-400/5" },
  silver: { label: "Silver — Cleaned & validated", desc: "Deduplicated, schema-enforced, null-handled. Source of truth for BI.", color: "text-slate-300", bg: "border-slate-300/30 bg-slate-300/5" },
  gold: { label: "Gold — Aggregated & ML-ready", desc: "Business metrics, feature stores, and model training datasets.", color: "text-yellow-400", bg: "border-yellow-400/30 bg-yellow-400/5" },
};

const SNAPSHOTS = [
  { id: "snap-001", table: "cleaned_events", version: 42, ts: "2026-07-25 04:30", rows: 178_200_000, operation: "append" },
  { id: "snap-002", table: "finance_facts", version: 18, ts: "2026-07-24 23:00", rows: 320_000, operation: "overwrite" },
  { id: "snap-003", table: "ml_training_sets", version: 7, ts: "2026-07-20 18:00", rows: 2_400_000, operation: "append" },
  { id: "snap-004", table: "agent_performance", version: 31, ts: "2026-07-25 05:00", rows: 92_000, operation: "append" },
];

function ZonesPanel() {
  const zones: Zone[] = ["bronze", "silver", "gold"];
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">HiveLake uses a Bronze / Silver / Gold medallion architecture built on Apache Iceberg. Each zone enforces different data quality, retention, and access policies. All tables support time-travel queries and schema evolution without rewrites.</p>
      {zones.map(z => {
        const m = ZONE_META[z];
        const tables = TABLES.filter(t => t.zone === z);
        const totalGb = tables.reduce((s, t) => s + t.sizeGb, 0);
        const totalRows = tables.reduce((s, t) => s + t.rows, 0);
        return (
          <div key={z} className={`rounded-xl border p-4 ${m.bg}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`text-sm font-bold ${m.color}`}>{m.label}</h3>
                <p className="mt-0.5 text-xs text-text-secondary">{m.desc}</p>
              </div>
              <div className="text-right text-xs text-text-secondary">
                <div className={`font-bold ${m.color}`}>{totalGb.toFixed(1)} GB</div>
                <div>{totalRows.toLocaleString()} rows</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tables.map(t => (
                <span key={t.name} className="rounded-md border border-border bg-surface/40 px-2 py-1 text-xs text-text-primary font-mono">{t.name}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TablesPanel() {
  const [filter, setFilter] = useState<Zone | "all">("all");
  const shown = filter === "all" ? TABLES : TABLES.filter(t => t.zone === filter);
  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-2">
        {(["all", "bronze", "silver", "gold"] as const).map(z => (
          <button key={z} onClick={() => setFilter(z)} className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors ${filter === z ? "border-primary-accent text-primary-accent bg-primary-accent/10" : "border-border text-text-secondary hover:text-text-primary"}`}>{z}</button>
        ))}
      </div>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead className="border-b border-border bg-surface-elevated/40">
            <tr>{["Table", "Zone", "Rows", "Size", "Format", "Partitions", "Updated"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.map(t => (
              <tr key={t.name} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                <td className="px-3 py-2 font-mono font-semibold text-text-primary">{t.name}</td>
                <td className="px-3 py-2"><span className={`font-semibold ${ZONE_META[t.zone].color}`}>{t.zone}</span></td>
                <td className="px-3 py-2 text-text-secondary">{t.rows.toLocaleString()}</td>
                <td className="px-3 py-2 text-text-secondary">{t.sizeGb} GB</td>
                <td className="px-3 py-2 text-text-secondary">{t.format}</td>
                <td className="px-3 py-2 font-mono text-text-secondary">{t.partitions}</td>
                <td className="px-3 py-2 text-text-secondary">{t.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SnapshotsPanel() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">Every write to HiveLake creates an immutable Iceberg snapshot. Query any point in time with <code className="text-primary-accent">FOR SYSTEM_TIME AS OF</code>. Roll back any table to a previous snapshot without data movement.</p>
      <div className="space-y-2">
        {SNAPSHOTS.map(s => (
          <div key={s.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-mono text-sm font-semibold text-text-primary">{s.table}</span>
                <span className="ml-2 text-xs text-text-secondary">v{s.version}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${s.operation === "overwrite" ? "border-orange-400/40 text-orange-400 bg-orange-400/10" : "border-primary-accent/40 text-primary-accent bg-primary-accent/10"}`}>{s.operation}</span>
                <button className="rounded-md border border-border px-2 py-1 text-xs text-text-secondary hover:border-primary-accent/40 hover:text-primary-accent transition-colors">Restore</button>
              </div>
            </div>
            <p className="mt-1 text-xs text-text-secondary">{s.rows.toLocaleString()} rows · {s.ts}</p>
            <p className="mt-0.5 font-mono text-[10px] text-text-secondary">id: {s.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["zones", "Data Zones", Database],
  ["tables", "Tables", GitBranch],
  ["snapshots", "Snapshots", Archive],
];

export default function HiveLakePage() {
  const [tab, setTab] = useState<Tab>("zones");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveLake™ · Tier 2</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Apache Iceberg data lake — Bronze / Silver / Gold with time-travel</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveLake is the platform&apos;s open table format data lake. All platform events, agent traces, and business facts flow through Bronze → Silver → Gold zones. Every write is an immutable Iceberg snapshot — query any point in history, roll back without data movement.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "zones" && <ZonesPanel />}
      {tab === "tables" && <TablesPanel />}
      {tab === "snapshots" && <SnapshotsPanel />}
    </main>
  );
}
