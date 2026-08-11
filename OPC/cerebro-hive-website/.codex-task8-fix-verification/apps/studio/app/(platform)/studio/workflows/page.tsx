"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWorkflows } from "@/lib/platform/hooks";
import { platformApi, type Workflow } from "@/lib/platform/api-client";
import { DataTable, type Column } from "@/components/platform/DataTable";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { SearchBar } from "@/components/platform/SearchBar";

const STATUS_OPTIONS = [
  { label: "All",       value: "" },
  { label: "Draft",     value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived",  value: "ARCHIVED" },
];

// ── New workflow modal ────────────────────────────────────────────────────────

interface NewWorkflowModalProps {
  onClose:  () => void;
  onCreate: (id: string) => void;
}

function NewWorkflowModal({ onClose, onCreate }: NewWorkflowModalProps) {
  const [name, setName]         = useState("");
  const [description, setDesc]  = useState("");
  const [submitting, setSubmit] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmit(true);
    setError(null);
    try {
      const wf = await platformApi.workflows.create({ name: name.trim(), description: description.trim() });
      onCreate(wf.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow");
      setSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Workflow</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Name *</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Workflow"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                         placeholder-neutral-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Description</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="What does this workflow do?"
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                         placeholder-neutral-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>
          )}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400
                         hover:border-neutral-700 hover:text-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                         hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Creating…" : "Create Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  const router                = useRouter();
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [showModal, setModal] = useState(false);

  const { items: workflows, loading, error, refresh, hasMore, nextPage, total } = useWorkflows({
    search: search || undefined,
    status: status || undefined,
  });

  const handleCreate = useCallback((id: string) => {
    setModal(false);
    router.push(`/studio/workflows/${id}`);
  }, [router]);

  const handlePublish = useCallback(async (wf: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await platformApi.workflows.publish(wf.id); refresh(); } catch { /* noop */ }
  }, [refresh]);

  const handleArchive = useCallback(async (wf: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Archive "${wf.name}"?`)) return;
    try { await platformApi.workflows.archive(wf.id); refresh(); } catch { /* noop */ }
  }, [refresh]);

  const COLUMNS: Column<Workflow>[] = [
    {
      key:    "name",
      header: "Workflow",
      render: (wf) => (
        <div>
          <p className="font-medium text-white">{wf.name}</p>
          {wf.description && (
            <p className="mt-0.5 max-w-xs truncate text-xs text-neutral-500">{wf.description}</p>
          )}
        </div>
      ),
    },
    {
      key:    "status",
      header: "Status",
      render: (wf) => <StatusBadge status={wf.status} />,
      className: "whitespace-nowrap",
    },
    {
      key:    "version",
      header: "Version",
      render: (wf) => <span className="font-mono text-xs text-neutral-500">v{wf.version}</span>,
      className: "whitespace-nowrap",
    },
    {
      key:    "tags",
      header: "Tags",
      render: (wf) => (
        <div className="flex flex-wrap gap-1">
          {(wf.tags ?? []).map(tag => (
            <span key={tag} className="rounded-full border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-xs text-neutral-400">
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      key:    "updatedAt",
      header: "Last updated",
      render: (wf) => (
        <span className="text-xs text-neutral-500">
          {new Date(wf.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
      className: "whitespace-nowrap",
    },
    {
      key:    "actions",
      header: "",
      render: (wf) => (
        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
          {wf.status === "DRAFT" && (
            <button
              onClick={e => handlePublish(wf, e)}
              className="rounded-md border border-emerald-800 bg-emerald-950 px-2.5 py-1 text-xs
                         font-medium text-emerald-400 hover:bg-emerald-900 transition-colors"
            >
              Publish
            </button>
          )}
          {wf.status === "PUBLISHED" && (
            <button
              onClick={e => handleArchive(wf, e)}
              className="rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs
                         font-medium text-neutral-400 hover:bg-neutral-800 transition-colors"
            >
              Archive
            </button>
          )}
        </div>
      ),
      className: "w-px whitespace-nowrap",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          {total > 0 && <p className="mt-0.5 text-sm text-neutral-500">{total.toLocaleString()} total</p>}
        </div>
        <button
          onClick={() => setModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm
                     font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
          </svg>
          New Workflow
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search workflows…" className="flex-1" />
        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                status === opt.value
                  ? "border-indigo-600 bg-indigo-950 text-indigo-400"
                  : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={refresh} className="ml-3 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <DataTable<Workflow>
        columns={COLUMNS}
        data={workflows}
        loading={loading}
        rowKey={wf => wf.id}
        onRowClick={wf => router.push(`/studio/workflows/${wf.id}`)}
        empty={
          <div className="flex flex-col items-center gap-3">
            <svg className="h-10 w-10 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-neutral-500">
              {search || status ? "No workflows match your filters." : "No workflows yet."}
            </p>
            {!search && !status && (
              <button onClick={() => setModal(true)} className="text-sm text-indigo-400 underline hover:no-underline">
                Create your first workflow
              </button>
            )}
          </div>
        }
      />

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={nextPage}
            disabled={loading}
            className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-400
                       hover:border-neutral-700 hover:text-neutral-300 disabled:opacity-50 transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {showModal && <NewWorkflowModal onClose={() => setModal(false)} onCreate={handleCreate} />}
    </div>
  );
}
