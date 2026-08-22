"use client";

import React, { useState, useCallback } from "react";
import { SearchBar }   from "@/components/platform/SearchBar";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { MetricTile }  from "@/components/platform/MetricTile";
import { usePrompts }  from "@/lib/platform/hooks";
import { platformApi } from "@/lib/platform/api-client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ARCH-LINT: Deferred
import type { Prompt, PromptVersion } from "@/lib/platform/api-client";

function PromptCard({ prompt, selected, onClick }: { prompt: Prompt; selected: boolean; onClick: () => void }) {
  const active = prompt.versions.find(v => v.version === prompt.activeVersion);
  return (
    <div onClick={onClick} className={`cursor-pointer rounded-xl border p-4 transition-all ${selected ? "border-indigo-700 bg-indigo-950/30" : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{prompt.name}</p>
          <code className="text-xs text-neutral-600">{prompt.slug}</code>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={prompt.status} />
          <span className="font-mono text-xs text-neutral-500">v{prompt.activeVersion}</span>
        </div>
      </div>
      <p className="mb-3 text-xs text-neutral-500 line-clamp-2">{prompt.description}</p>
      {active?.metrics && (
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 p-2 text-xs">
          <div className="text-center"><p className="text-neutral-600">Success</p><p className="font-medium text-emerald-400">{(active.metrics.successRate * 100).toFixed(1)}%</p></div>
          <div className="text-center"><p className="text-neutral-600">Avg tokens</p><p className="font-medium text-white">{active.metrics.avgTokens}</p></div>
          <div className="text-center"><p className="text-neutral-600">Runs</p><p className="font-medium text-white">{active.metrics.runs.toLocaleString()}</p></div>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {prompt.tags.map(tag => (
          <span key={tag} className="rounded-full border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-xs text-neutral-500">{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function PromptsPage() {
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("");
  const [selectedId, setSelected] = useState<string | null>(null);
  const [activeVer, setActiveVer] = useState<number | null>(null);
  const [showNew, setShowNew]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [newForm, setNewForm]     = useState({ name: "", content: "", model: "claude-haiku-4-5-20251001", description: "", category: "general" });

  const { items: prompts, loading, error, refresh } = usePrompts({ status: undefined, category: category || undefined, search: search || undefined });

  const categories = [...new Set(prompts.map(p => p.category))];
  const selected   = prompts.find(p => p.id === selectedId) ?? null;
  const displayVer = selected
    ? (selected.versions.find(v => v.version === (activeVer ?? selected.activeVersion)) ?? null)
    : null;

  const published  = prompts.filter(p => p.status === "PUBLISHED").length;
  const totalRuns  = prompts.flatMap(p => p.versions).reduce((s, v) => s + (v.metrics?.runs ?? 0), 0);
  const avgSuccess = prompts.flatMap(p => p.versions).filter(v => v.metrics).reduce((s, v) => s + (v.metrics?.successRate ?? 0), 0)
                   / Math.max(prompts.flatMap(p => p.versions).filter(v => v.metrics).length, 1);

  const handlePublish = useCallback(async (id: string) => {
    await platformApi.prompts.publish(id);
    void refresh();
  }, [refresh]);

  const handleActivate = useCallback(async (promptId: string, version: number) => {
    await platformApi.prompts.versions.activate(promptId, version);
    void refresh();
  }, [refresh]);

  const handleCreate = useCallback(async () => {
    if (!newForm.name.trim() || !newForm.content.trim()) return;
    setSaving(true);
    try {
      await platformApi.prompts.create({ ...newForm });
      setShowNew(false);
      setNewForm({ name: "", content: "", model: "claude-haiku-4-5-20251001", description: "", category: "general" });
      void refresh();
    } finally {
      setSaving(false);
    }
  }, [newForm, refresh]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prompt Registry</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Versioned prompts with A/B testing and metrics</p>
        </div>
        <button onClick={() => setShowNew(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">+ New Prompt</button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="Published"    value={loading ? "…" : published} />
        <MetricTile label="Total Runs"   value={loading ? "…" : totalRuns.toLocaleString()} />
        <MetricTile label="Avg Success"  value={loading ? "…" : `${(avgSuccess * 100).toFixed(1)}%`} />
        <MetricTile label="Prompt Store" value={loading ? "…" : prompts.length} sub="total prompts" />
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error} — <button onClick={() => void refresh()} className="underline">retry</button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search prompts…" className="flex-1 max-w-xs" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-400 outline-none focus:border-indigo-500">
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/40" />
          )) : prompts.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">No prompts yet. Create your first prompt.</div>
          ) : prompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} selected={selectedId === prompt.id}
              onClick={() => { setSelected(selectedId === prompt.id ? null : prompt.id); setActiveVer(null); }} />
          ))}
        </div>

        {selected && displayVer && (
          <div className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-white">{selected.name}</h2>
                <p className="mt-0.5 text-xs text-neutral-500">{selected.versions.length} version{selected.versions.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={activeVer ?? selected.activeVersion} onChange={e => setActiveVer(Number(e.target.value))}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-400 outline-none">
                  {selected.versions.map(v => <option key={v.version} value={v.version}>v{v.version}{v.version === selected.activeVersion ? " (active)" : ""}</option>)}
                </select>
                <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-neutral-300">
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg>
                </button>
              </div>
            </div>

            {displayVer.metrics && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
                  <p className="text-xs text-neutral-500">Success Rate</p>
                  <p className="mt-1 text-xl font-bold text-emerald-400">{(displayVer.metrics.successRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-neutral-600">{displayVer.metrics.runs.toLocaleString()} runs</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
                  <p className="text-xs text-neutral-500">Avg Latency</p>
                  <p className="mt-1 text-xl font-bold text-white">{displayVer.metrics.avgLatencyMs}ms</p>
                  <p className="text-xs text-neutral-600">{displayVer.metrics.avgTokens} avg tokens</p>
                </div>
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Model</p>
              <code className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1 font-mono text-xs text-neutral-300">{displayVer.model}</code>
            </div>

            {displayVer.variables.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Variables</p>
                <div className="flex flex-wrap gap-1">
                  {displayVer.variables.map(v => <code key={v} className="rounded border border-amber-900 bg-amber-950/40 px-2 py-0.5 font-mono text-xs text-amber-400">{`{{${v}}}`}</code>)}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Content</p>
              <pre className="max-h-48 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-300 whitespace-pre-wrap">{displayVer.content}</pre>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {selected.status === "DRAFT" && (
                  <button onClick={() => void handlePublish(selected.id)} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors">Publish</button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(activeVer ?? selected.activeVersion) !== selected.activeVersion && (
                  <button onClick={() => void handleActivate(selected.id, activeVer ?? selected.activeVersion)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors">Set as Active</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">New Prompt</h2>
              <button onClick={() => setShowNew(false)} className="text-neutral-500 hover:text-neutral-300">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {([["Name", "name", "text", "e.g. Customer Support Triage"], ["Description", "description", "text", "What this prompt does…"]] as [string, string, string, string][]).map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-400">{label}</label>
                  <input type={type} placeholder={ph} value={(newForm as Record<string, string>)[key]} onChange={e => setNewForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-500" />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">Model</label>
                <select value={newForm.model} onChange={e => setNewForm(f => ({ ...f, model: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 outline-none focus:border-indigo-500">
                  {["claude-haiku-4-5-20251001", "claude-sonnet-5", "claude-opus-4-8", "claude-fable-5"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">Initial Content (v1)</label>
                <textarea rows={5} placeholder="You are a helpful assistant. {{input}}" value={newForm.content} onChange={e => setNewForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-500 font-mono resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowNew(false)} className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:border-neutral-700 transition-colors">Cancel</button>
                <button onClick={() => void handleCreate()} disabled={saving || !newForm.name.trim() || !newForm.content.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                  {saving ? "Creating…" : "Create Prompt"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
