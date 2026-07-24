"use client";

import React, { useState, useCallback } from "react";
import { useAgents } from "@/lib/platform/hooks";
import { platformApi, type Agent } from "@/lib/platform/api-client";
import { DataTable, type Column } from "@/components/platform/DataTable";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { SearchBar } from "@/components/platform/SearchBar";

// ── New Agent modal ───────────────────────────────────────────────────────────

const MODELS = [
  "claude-sonnet-5",
  "claude-opus-4-8",
  "claude-haiku-4-5-20251001",
  "gpt-4o",
  "gpt-4o-mini",
];

interface NewAgentModalProps {
  onClose:  () => void;
  onCreated: () => void;
}

function NewAgentModal({ onClose, onCreated }: NewAgentModalProps) {
  const [name, setName]         = useState("");
  const [description, setDesc]  = useState("");
  const [model, setModel]       = useState(MODELS[0]!);
  const [instructions, setInst] = useState("");
  const [submitting, setSubmit] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmit(true);
    setError(null);
    try {
      await platformApi.agents.create({ name: name.trim(), description: description.trim(), model, instructions: instructions.trim() });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create agent");
      setSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Agent</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">Name *</label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Research Assistant"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                           placeholder-neutral-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">Model</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                           outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              >
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Description</label>
            <input
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="Brief description of what this agent does"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                         placeholder-neutral-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">System Instructions</label>
            <textarea
              value={instructions}
              onChange={e => setInst(e.target.value)}
              rows={4}
              placeholder="You are a helpful assistant that…"
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                         placeholder-neutral-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 font-mono"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>
          )}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400
                         hover:border-neutral-700 hover:text-neutral-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                         hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {submitting ? "Creating…" : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [search, setSearch]   = useState("");
  const [showModal, setModal] = useState(false);

  const { items: agents, loading, error, refresh, total, hasMore, nextPage } = useAgents({ search: search || undefined });

  const handleDeactivate = useCallback(async (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await platformApi.agents.update(agent.id, { status: "DEPRECATED" }); refresh(); } catch { /* noop */ }
  }, [refresh]);

  const COLUMNS: Column<Agent>[] = [
    {
      key:    "name",
      header: "Agent",
      render: (agent) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                          border border-neutral-800 bg-neutral-800/60 text-sm font-bold text-indigo-400">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{agent.name}</p>
            {agent.description && (
              <p className="mt-0.5 max-w-xs truncate text-xs text-neutral-500">{agent.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key:    "status",
      header: "Status",
      render: (agent) => <StatusBadge status={agent.status} />,
      className: "whitespace-nowrap",
    },
    {
      key:    "model",
      header: "Model",
      render: (agent) => (
        <span className="font-mono text-xs text-neutral-400">{agent.model}</span>
      ),
    },
    {
      key:    "version",
      header: "Version",
      render: (agent) => <span className="font-mono text-xs text-neutral-500">v{agent.version}</span>,
      className: "whitespace-nowrap",
    },
    {
      key:    "tools",
      header: "Tools",
      render: (agent) => {
        const tools = (agent.tools ?? []) as string[];
        if (tools.length === 0) return <span className="text-xs text-neutral-600">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tools.slice(0, 3).map(t => (
              <span key={t} className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-xs text-neutral-400">{t}</span>
            ))}
            {tools.length > 3 && (
              <span className="text-xs text-neutral-600">+{tools.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      key:    "actions",
      header: "",
      render: (agent) => (
        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
          {agent.status === "ACTIVE" && (
            <button
              onClick={e => handleDeactivate(agent, e)}
              className="rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs
                         font-medium text-neutral-400 hover:bg-neutral-800 transition-colors"
            >
              Deactivate
            </button>
          )}
        </div>
      ),
      className: "w-px whitespace-nowrap",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
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
          New Agent
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search agents…" className="max-w-sm" />

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error} <button onClick={refresh} className="ml-3 underline hover:no-underline">Retry</button>
        </div>
      )}

      <DataTable<Agent>
        columns={COLUMNS}
        data={agents}
        loading={loading}
        rowKey={a => a.id}
        empty={
          <div className="flex flex-col items-center gap-3">
            <svg className="h-10 w-10 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 00.75-1.69V8.464M19.8 15l-5.25 2.25m-10.05-2.25L9.5 17.25M4.5 8.464V13.31a2.25 2.25 0 00.75 1.69" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-neutral-500">
              {search ? "No agents match your search." : "No agents yet — create one to get started."}
            </p>
            {!search && (
              <button onClick={() => setModal(true)} className="text-sm text-indigo-400 underline hover:no-underline">
                Create your first agent
              </button>
            )}
          </div>
        }
      />

      {hasMore && (
        <div className="flex justify-center">
          <button onClick={nextPage} disabled={loading}
            className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-400
                       hover:border-neutral-700 hover:text-neutral-300 disabled:opacity-50 transition-colors">
            Load more
          </button>
        </div>
      )}

      {showModal && (
        <NewAgentModal
          onClose={() => setModal(false)}
          onCreated={() => { setModal(false); refresh(); }}
        />
      )}
    </div>
  );
}
