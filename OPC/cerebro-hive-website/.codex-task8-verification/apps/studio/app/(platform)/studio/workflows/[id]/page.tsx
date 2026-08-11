"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWorkflow, useWorkflowExecutions, useExecuteWorkflow } from "@/lib/platform/hooks";
import { platformApi, type WorkflowExecution } from "@/lib/platform/api-client";
import { DataTable, type Column } from "@/components/platform/DataTable";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { MetricTile } from "@/components/platform/MetricTile";

// ── Run workflow modal ────────────────────────────────────────────────────────

interface RunModalProps {
  workflowId: string;
  onClose:    () => void;
  onStarted:  (execId: string) => void;
}

function RunModal({ workflowId, onClose, onStarted }: RunModalProps) {
  const [inputJson, setInputJson] = useState("{}");
  const [testMode, setTestMode]   = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const { execute, loading, error } = useExecuteWorkflow();

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    let input: Record<string, unknown> = {};
    try {
      input = JSON.parse(inputJson) as Record<string, unknown>;
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON");
      return;
    }
    const exec = await execute(workflowId, input, testMode).catch(() => null);
    if (exec) onStarted(exec.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Run Workflow</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleRun} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Input (JSON)</label>
            <textarea
              value={inputJson}
              onChange={e => setInputJson(e.target.value)}
              rows={6}
              className={`w-full resize-y rounded-lg border px-3 py-2 font-mono text-sm text-white
                          placeholder-neutral-600 outline-none
                          bg-neutral-900 focus:ring-1 focus:ring-indigo-500/30 transition-colors ${
                jsonError ? "border-red-700 focus:border-red-600" : "border-neutral-800 focus:border-indigo-500"
              }`}
            />
            {jsonError && <p className="mt-1 text-xs text-red-400">{jsonError}</p>}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-400">
            <input
              type="checkbox"
              checked={testMode}
              onChange={e => setTestMode(e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-900 text-indigo-600"
            />
            Test mode (dry run, no side effects)
          </label>
          {error && <p className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400
                         hover:border-neutral-700 hover:text-neutral-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white
                         hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? "Starting…" : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3 3.732a1.5 1.5 0 012.305-1.265l6.706 4.267a1.5 1.5 0 010 2.53L5.305 13.53A1.5 1.5 0 013 12.267V3.732z"/>
                  </svg>
                  Run
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Execution history table ───────────────────────────────────────────────────

const EXEC_COLUMNS: Column<WorkflowExecution>[] = [
  {
    key:    "id",
    header: "Execution ID",
    render: (ex) => <code className="font-mono text-xs text-neutral-400">{ex.id.slice(0, 12)}…</code>,
  },
  {
    key:    "status",
    header: "Status",
    render: (ex) => <StatusBadge status={ex.status} />,
    className: "whitespace-nowrap",
  },
  {
    key:    "trigger",
    header: "Trigger",
    render: (ex) => (
      <span className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-xs text-neutral-400">
        {ex.triggerType ?? "manual"}
      </span>
    ),
  },
  {
    key:    "duration",
    header: "Duration",
    render: (ex) => {
      if (!ex.completedAt || !ex.startedAt) return <span className="text-xs text-neutral-600">—</span>;
      const ms = new Date(ex.completedAt).getTime() - new Date(ex.startedAt).getTime();
      const s  = (ms / 1000).toFixed(1);
      return <span className="text-xs text-neutral-400">{Number(s) >= 60 ? `${(Number(s)/60).toFixed(1)}m` : `${s}s`}</span>;
    },
    className: "whitespace-nowrap",
  },
  {
    key:    "startedAt",
    header: "Started",
    render: (ex) => (
      <span className="text-xs text-neutral-500">
        {new Date(ex.startedAt ?? ex.createdAt ?? "").toLocaleString(undefined, {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        })}
      </span>
    ),
    className: "whitespace-nowrap",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkflowDetailPage() {
  const router              = useRouter();
  const { id }              = useParams<{ id: string }>();
  const [showRun, setRun]   = useState(false);

  const { workflow, loading: wfLoading, error: wfError, refresh } = useWorkflow(id);
  const { items: executions, loading: execLoading, total: execTotal } = useWorkflowExecutions(id);

  const handlePublish = useCallback(async () => {
    try { await platformApi.workflows.publish(id); refresh(); } catch { /* noop */ }
  }, [id, refresh]);

  const handleArchive = useCallback(async () => {
    if (!confirm("Archive this workflow?")) return;
    try { await platformApi.workflows.archive(id); router.push("/studio/workflows"); } catch { /* noop */ }
  }, [id, router]);

  if (wfLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-800" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-800/60" />
          ))}
        </div>
      </div>
    );
  }

  if (wfError || !workflow) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-6 text-center">
          <p className="text-sm text-red-400">{wfError ?? "Workflow not found"}</p>
          <button onClick={() => router.push("/studio/workflows")} className="mt-3 text-xs text-neutral-500 underline hover:no-underline">
            Back to workflows
          </button>
        </div>
      </div>
    );
  }

  const completedExecs = executions.filter(e => e.status === "COMPLETED").length;
  const failedExecs    = executions.filter(e => e.status === "FAILED").length;
  const successRate    = executions.length > 0
    ? ((completedExecs / executions.length) * 100).toFixed(0)
    : "—";

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <button onClick={() => router.push("/studio/workflows")} className="hover:text-neutral-300 transition-colors">
          Workflows
        </button>
        <span>/</span>
        <span className="text-white">{workflow.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{workflow.name}</h1>
            <StatusBadge status={workflow.status} size="md" />
            <span className="font-mono text-xs text-neutral-500">v{workflow.version}</span>
          </div>
          {workflow.description && (
            <p className="max-w-2xl text-sm text-neutral-400">{workflow.description}</p>
          )}
          {(workflow.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(workflow.tags ?? []).map(tag => (
                <span key={tag} className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {workflow.status === "PUBLISHED" && (
            <button
              onClick={() => setRun(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white
                         hover:bg-emerald-600 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 3.732a1.5 1.5 0 012.305-1.265l6.706 4.267a1.5 1.5 0 010 2.53L5.305 13.53A1.5 1.5 0 013 12.267V3.732z"/>
              </svg>
              Run
            </button>
          )}
          {workflow.status === "DRAFT" && (
            <button onClick={handlePublish}
              className="rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm font-medium text-emerald-400
                         hover:bg-emerald-900 transition-colors">
              Publish
            </button>
          )}
          {workflow.status !== "ARCHIVED" && (
            <button onClick={handleArchive}
              className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400
                         hover:border-neutral-700 hover:text-neutral-300 transition-colors">
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricTile label="Total Runs" value={execTotal.toLocaleString()} loading={execLoading} />
        <MetricTile label="Completed"  value={completedExecs} loading={execLoading} />
        <MetricTile label="Failed"     value={failedExecs} loading={execLoading} />
        <MetricTile
          label="Success Rate"
          value={`${successRate}%`}
          loading={execLoading}
          trend={
            successRate !== "—"
              ? { value: `${successRate}%`, positive: Number(successRate) >= 95 }
              : undefined
          }
        />
      </div>

      {/* Workflow definition */}
      {Boolean(workflow.definition) && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-500">Definition</h2>
          <div className="max-h-48 overflow-auto rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <pre className="font-mono text-xs text-neutral-300">
              {JSON.stringify(workflow.definition, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Execution history */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Execution History
          {execTotal > 0 && <span className="ml-2 font-normal normal-case text-neutral-600">({execTotal})</span>}
        </h2>
        <DataTable<WorkflowExecution>
          columns={EXEC_COLUMNS}
          data={executions}
          loading={execLoading}
          rowKey={ex => ex.id}
          onRowClick={ex => router.push(`/studio/workflows/${id}/executions/${ex.id}`)}
          empty={
            <p className="text-sm text-neutral-500">
              No executions yet.{" "}
              {workflow.status === "PUBLISHED" && (
                <button onClick={() => setRun(true)} className="text-indigo-400 underline hover:no-underline">
                  Run now
                </button>
              )}
            </p>
          }
        />
      </div>

      {showRun && (
        <RunModal
          workflowId={id}
          onClose={() => setRun(false)}
          onStarted={execId => {
            setRun(false);
            router.push(`/studio/workflows/${id}/executions/${execId}`);
          }}
        />
      )}
    </div>
  );
}
