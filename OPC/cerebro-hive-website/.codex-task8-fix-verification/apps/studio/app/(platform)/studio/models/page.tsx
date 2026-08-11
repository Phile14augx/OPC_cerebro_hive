"use client";

import React, { useState, useCallback } from "react";
import { MetricTile } from "@/components/platform/MetricTile";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { useModels }   from "@/lib/platform/hooks";
import { platformApi } from "@/lib/platform/api-client";
import type { ModelEntry } from "@/lib/platform/api-client";

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "text-orange-400  border-orange-900  bg-orange-950/30",
  openai:    "text-emerald-400 border-emerald-900 bg-emerald-950/30",
  google:    "text-blue-400    border-blue-900    bg-blue-950/30",
  mistral:   "text-purple-400  border-purple-900  bg-purple-950/30",
  cohere:    "text-pink-400    border-pink-900    bg-pink-950/30",
};

const CAPABILITY_LABELS: Record<string, string> = {
  vision:       "Vision",
  function_call: "Tools",
  streaming:    "Streaming",
  json_mode:    "JSON Mode",
  reasoning:    "Reasoning",
};

function ProviderBadge({ provider }: { provider: string }) {
  const cls = PROVIDER_COLORS[provider.toLowerCase()] ?? "text-neutral-400 border-neutral-800 bg-neutral-900";
  return (
    <span className={`rounded border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>{provider}</span>
  );
}

function CapabilityChip({ cap }: { cap: string }) {
  return (
    <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">{CAPABILITY_LABELS[cap] ?? cap}</span>
  );
}

function ModelCard({ model, onClick, selected }: { model: ModelEntry; onClick: () => void; selected: boolean }) {
  const isActive = model.status === "ACTIVE";
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-indigo-600 bg-indigo-950/20"
          : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-white">{model.name}</span>
            <ProviderBadge provider={model.provider} />
          </div>
          <code className="mt-1 block truncate font-mono text-xs text-neutral-500">{model.id}</code>
        </div>
        <div className="shrink-0">
          <StatusBadge status={isActive ? "ACTIVE" : model.status} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(model.capabilities as string[]).map(c => <CapabilityChip key={c} cap={c} />)}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col">
          <span className="text-neutral-500">Context</span>
          <span className="font-mono text-neutral-300">{(model.contextWindow / 1000).toFixed(0)}k tokens</span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-500">Output</span>
          <span className="font-mono text-neutral-300">{model.maxOutput != null ? `${(model.maxOutput / 1000).toFixed(0)}k tokens` : "—"}</span>
        </div>
        {model.inputPricePer1M != null && (
          <div className="flex flex-col">
            <span className="text-neutral-500">Input / 1M</span>
            <span className="font-mono text-neutral-300">${Number(model.inputPricePer1M).toFixed(2)}</span>
          </div>
        )}
        {model.outputPricePer1M != null && (
          <div className="flex flex-col">
            <span className="text-neutral-500">Output / 1M</span>
            <span className="font-mono text-neutral-300">${Number(model.outputPricePer1M).toFixed(2)}</span>
          </div>
        )}
      </div>

      {model.available === false && (
        <div className="mt-2 rounded bg-red-950/40 px-2 py-1 text-xs text-red-400">Gateway unavailable</div>
      )}
    </button>
  );
}

const PROVIDERS = ["All", "Anthropic", "OpenAI", "Google", "Mistral", "Cohere"];
const CAPABILITIES_FILTER = ["All", "vision", "function_call", "streaming", "json_mode", "reasoning"];

export default function ModelsPage() {
  const [provider,    setProvider]    = useState("All");
  const [capability,  setCapability]  = useState("All");
  const [statusFilt,  setStatusFilt]  = useState("All");
  const [selected,    setSelected]    = useState<ModelEntry | null>(null);
  const [invalidating, setInvalidating] = useState(false);

  const { models, loading, error, refresh } = useModels({
    provider:   provider   !== "All" ? provider.toLowerCase() : undefined,
    capability: capability !== "All" ? capability : undefined,
    status:     statusFilt !== "All" ? statusFilt : undefined,
  });

  const active    = models.filter(m => m.status === "ACTIVE");
  const available = models.filter(m => m.available !== false);
  const providers = new Set(models.map(m => m.provider));

  const handleInvalidateCache = useCallback(async () => {
    setInvalidating(true);
    try {
      await platformApi.models.invalidateCache();
      void refresh();
    } finally {
      setInvalidating(false);
    }
  }, [refresh]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Model Catalog</h1>
          <p className="mt-0.5 text-sm text-neutral-500">AI models available via the gateway, with live availability status</p>
        </div>
        <button
          onClick={() => void handleInvalidateCache()}
          disabled={invalidating || loading}
          className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300 disabled:opacity-50 transition-colors"
        >
          {invalidating ? "Refreshing…" : "Refresh Cache"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="Total Models"  value={loading ? "…" : models.length} />
        <MetricTile label="Active"        value={loading ? "…" : active.length} />
        <MetricTile label="Available"     value={loading ? "…" : available.length} />
        <MetricTile label="Providers"     value={loading ? "…" : providers.size} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Provider</label>
          <div className="flex gap-1">
            {PROVIDERS.map(p => (
              <button key={p} onClick={() => setProvider(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${provider === p ? "bg-indigo-600 text-white" : "border border-neutral-800 text-neutral-400 hover:border-neutral-700"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Capability</label>
          <div className="flex flex-wrap gap-1">
            {CAPABILITIES_FILTER.map(c => (
              <button key={c} onClick={() => setCapability(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${capability === c ? "bg-indigo-600 text-white" : "border border-neutral-800 text-neutral-400 hover:border-neutral-700"}`}>
                {c === "All" ? "All" : (CAPABILITY_LABELS[c] ?? c)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Status</label>
          <div className="flex gap-1">
            {["All", "ACTIVE", "DEPRECATED", "INACTIVE"].map(s => (
              <button key={s} onClick={() => setStatusFilt(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilt === s ? "bg-indigo-600 text-white" : "border border-neutral-800 text-neutral-400 hover:border-neutral-700"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error} — <button onClick={() => void refresh()} className="underline">retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-neutral-800/40" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 p-12 text-center text-neutral-500">
          No models match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {models.map(m => (
            <ModelCard
              key={m.id}
              model={m}
              selected={selected?.id === m.id}
              onClick={() => setSelected(selected?.id === m.id ? null : m)}
            />
          ))}
        </div>
      )}

      {selected && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-white">{selected.name}</h2>
                <ProviderBadge provider={selected.provider} />
              </div>
              <code className="mt-0.5 block font-mono text-xs text-neutral-500">{selected.id}</code>
            </div>
            <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-neutral-300">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg>
            </button>
          </div>

          {selected.description && (
            <p className="mb-4 text-sm text-neutral-400">{selected.description}</p>
          )}

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              ["Context Window",    `${(selected.contextWindow / 1000).toFixed(0)}k tokens`],
              ["Max Output",        selected.maxOutput != null ? `${(selected.maxOutput / 1000).toFixed(0)}k tokens` : "N/A"],
              ["Input Price /1M",   selected.inputPricePer1M  != null ? `$${Number(selected.inputPricePer1M).toFixed(4)}`  : "N/A"],
              ["Output Price /1M",  selected.outputPricePer1M != null ? `$${Number(selected.outputPricePer1M).toFixed(4)}` : "N/A"],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs text-neutral-500">{label}</span>
                <span className="font-mono text-sm font-medium text-white">{val}</span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-neutral-500">Capabilities</p>
            <div className="flex flex-wrap gap-1.5">
              {(selected.capabilities as string[]).map(c => <CapabilityChip key={c} cap={c} />)}
            </div>
          </div>

          {selected.metadata && Object.keys(selected.metadata).length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-neutral-500">Metadata</p>
              <pre className="overflow-x-auto rounded-lg bg-neutral-950 p-3 text-xs text-neutral-400">
                {JSON.stringify(selected.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
