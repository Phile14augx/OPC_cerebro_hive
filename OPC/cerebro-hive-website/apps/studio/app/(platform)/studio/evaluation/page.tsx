"use client";

import React, { useState, useCallback } from "react";
import { MetricTile }    from "@/components/platform/MetricTile";
import { StatusBadge }   from "@/components/platform/StatusBadge";
import { DataTable, type Column } from "@/components/platform/DataTable";
import { useEvalRuns, useEvalDatasets } from "@/lib/platform/hooks";
import { platformApi }   from "@/lib/platform/api-client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ARCH-LINT: Deferred
import type { EvalRun, EvalMetrics } from "@/lib/platform/api-client";

function MetricBar({ label, value }: { label: string; value: number }) {
  const isLatency  = label.includes("latency");
  const displayVal = isLatency ? `${value}ms` : `${(value * 100).toFixed(1)}%`;
  const barPct     = isLatency ? Math.min((1 - value / 3000), 1) * 100 : value * 100;
  const good       = isLatency ? value < 500  : value >= 0.90;
  const warn       = isLatency ? value < 2000 : value >= 0.75;
  const color      = good ? "bg-emerald-500" : warn ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500">{label.replace(/_/g, " ")}</span>
        <span className={`font-medium ${good ? "text-emerald-400" : warn ? "text-amber-400" : "text-red-400"}`}>{displayVal}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${barPct}%` }} />
      </div>
    </div>
  );
}

const COLUMNS: Column<EvalRun>[] = [
  {
    key: "name", header: "Evaluation",
    render: (run) => (
      <div>
        <p className="font-medium text-white">{run.name}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{run.dataset?.name ?? run.datasetId ?? "—"} · {run.model}</p>
      </div>
    ),
  },
  { key: "status", header: "Status", render: (run) => <StatusBadge status={run.status} />, className: "whitespace-nowrap" },
  {
    key: "samples", header: "Samples",
    render: (run) => (
      <div>
        <span className="text-sm text-white">{run.passed}/{run.samples}</span>
        {run.samples > 0 && <span className="ml-1 text-xs text-neutral-500">({((run.passed / run.samples) * 100).toFixed(1)}%)</span>}
      </div>
    ),
  },
  {
    key: "accuracy", header: "Accuracy",
    render: (run) => {
      const acc = run.metrics.accuracy ?? 0;
      return <span className={`font-mono text-sm font-medium ${acc >= 0.95 ? "text-emerald-400" : acc >= 0.80 ? "text-amber-400" : "text-red-400"}`}>{(acc * 100).toFixed(1)}%</span>;
    },
    className: "whitespace-nowrap",
  },
  {
    key: "latency", header: "P50 Latency",
    render: (run) => <span className="font-mono text-xs text-neutral-400">{run.metrics.latency_p50 ?? "—"}ms</span>,
    className: "whitespace-nowrap",
  },
  {
    key: "startedAt", header: "Run date",
    render: (run) => <span className="text-xs text-neutral-500">{run.startedAt ? new Date(run.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}</span>,
    className: "whitespace-nowrap",
  },
];

export default function EvaluationPage() {
  const [selected, setSelected] = useState<EvalRun | null>(null);
  const [showNewRun, setNewRun] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [newForm, setNewForm]   = useState({ name: "", promptSlug: "", model: "claude-sonnet-5", datasetId: "" });

  const { items: runs, loading, error, refresh } = useEvalRuns();
  const { datasets } = useEvalDatasets();

  const completed  = runs.filter(r => r.status === "COMPLETED");
  const avgAccuracy = completed.reduce((s, r) => s + (r.metrics.accuracy ?? 0), 0) / Math.max(completed.length, 1);
  const totalSamples = runs.reduce((s, r) => s + r.samples, 0);

  const handleCancel = useCallback(async (id: string) => {
    await platformApi.evaluations.runs.cancel(id);
    void refresh();
  }, [refresh]);

  const handleCreate = useCallback(async () => {
    if (!newForm.name.trim() || !newForm.model.trim()) return;
    setSaving(true);
    try {
      await platformApi.evaluations.runs.create({ ...newForm });
      setNewRun(false);
      setNewForm({ name: "", promptSlug: "", model: "claude-sonnet-5", datasetId: "" });
      void refresh();
    } finally {
      setSaving(false);
    }
  }, [newForm, refresh]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Evaluation</h1>
          <p className="mt-0.5 text-sm text-neutral-500">LLM eval runs powered by RAGAS + custom metrics</p>
        </div>
        <button onClick={() => setNewRun(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">+ New Eval Run</button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="Total Runs"    value={loading ? "…" : runs.length} />
        <MetricTile label="Avg Accuracy"  value={loading ? "…" : `${(avgAccuracy * 100).toFixed(1)}%`} />
        <MetricTile label="Total Samples" value={loading ? "…" : totalSamples.toLocaleString()} />
        <MetricTile label="Running Now"   value={loading ? "…" : runs.filter(r => r.status === "RUNNING").length} />
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error} — <button onClick={() => void refresh()} className="underline">retry</button>
        </div>
      )}

      <DataTable<EvalRun>
        columns={COLUMNS}
        data={runs}
        loading={loading}
        rowKey={r => r.id}
        onRowClick={r => setSelected(selected?.id === r.id ? null : r)}
      />

      {selected && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-bold text-white">{selected.name}</h2>
              <p className="mt-0.5 text-xs text-neutral-500">{selected.dataset?.name ?? selected.datasetId ?? "No dataset"} · {selected.model} · {selected.samples} samples</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-neutral-300">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Metrics</p>
              {(Object.entries(selected.metrics) as [string, number][])
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([key, val]) => <MetricBar key={key} label={key} value={val} />)}
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Run Details</p>
              <div className="space-y-2 text-sm">
                {[
                  ["Status",     <StatusBadge key="s" status={selected.status} />],
                  ["Pass rate",  `${selected.passed}/${selected.samples}${selected.samples > 0 ? ` (${((selected.passed/selected.samples)*100).toFixed(1)}%)` : ""}`],
                  ["Prompt",     <code key="p" className="font-mono text-xs text-neutral-300">{selected.promptSlug || "—"}</code>],
                  ["Model",      <code key="m" className="font-mono text-xs text-neutral-300">{selected.model}</code>],
                  ["Started",    selected.startedAt ? <span key="st" className="text-xs text-neutral-300">{new Date(selected.startedAt).toLocaleString()}</span> : "—"],
                  ...(selected.completedAt && selected.startedAt ? [["Duration", `${((new Date(selected.completedAt).getTime() - new Date(selected.startedAt).getTime()) / 60_000).toFixed(1)} min`]] : []),
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between">
                    <span className="text-neutral-500">{label}</span>
                    <span className="text-white">{val}</span>
                  </div>
                ))}
              </div>
              {selected.errorMsg && (
                <div className="mt-3 rounded-lg border border-red-900 bg-red-950/30 p-3 text-xs text-red-400">{selected.errorMsg}</div>
              )}
              <div className="mt-4 flex gap-2">
                {["QUEUED", "RUNNING"].includes(selected.status) && (
                  <button onClick={() => void handleCancel(selected.id)} className="rounded-lg border border-red-900 px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-700 transition-colors">Cancel Run</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">New Evaluation Run</h2>
              <button onClick={() => setNewRun(false)} className="text-neutral-500 hover:text-neutral-300">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">Evaluation Name</label>
                <input placeholder="e.g. Support Triage v4" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">Prompt Slug</label>
                <input placeholder="e.g. customer-support-triage" value={newForm.promptSlug} onChange={e => setNewForm(f => ({ ...f, promptSlug: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">Dataset</label>
                <select value={newForm.datasetId} onChange={e => setNewForm(f => ({ ...f, datasetId: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 outline-none focus:border-indigo-500">
                  <option value="">Select a dataset…</option>
                  {datasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.rowCount} rows)</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">Model</label>
                <select value={newForm.model} onChange={e => setNewForm(f => ({ ...f, model: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 outline-none focus:border-indigo-500">
                  {["claude-haiku-4-5-20251001", "claude-sonnet-5", "claude-opus-4-8", "claude-fable-5", "gpt-4o", "gpt-4o-mini"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setNewRun(false)} className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:border-neutral-700 transition-colors">Cancel</button>
                <button onClick={() => void handleCreate()} disabled={saving || !newForm.name.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                  {saving ? "Starting…" : "Start Eval"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
