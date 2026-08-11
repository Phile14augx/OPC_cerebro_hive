"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, GitBranch } from "lucide-react";
import { api, checkOnline, type SearchResult } from "./lib";

type Tab = "search" | "about";
const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">{label}</span>{children}</label>;
}

function SearchPanel({ online }: { online: boolean | null }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try { setResults(await api<SearchResult[]>(`/knowledge/search?q=${encodeURIComponent(query)}&limit=12`)); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">HiveVector provides a unified vector index over all ingested documents and agent memories. Queries are embedded using the active embedding model and ranked by cosine similarity. Results include the raw chunk, parent document, and similarity score for downstream reranking.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <Field label="Query">
          <div className="flex gap-2 mt-1">
            <input className={inputCls} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="e.g. revenue targets Q4 APAC region" />
            <button onClick={search} disabled={busy || !online} className={`shrink-0 ${btnPrimary}`}>{busy ? "…" : "Search"}</button>
          </div>
        </Field>
      </section>
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{results.length} results</h2>
          {results.map(r => (
            <div key={r.chunkId} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-primary-accent">{r.title}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-text-secondary">chunk:{r.chunkId} · doc:{r.documentId}</div>
                </div>
                <div className="shrink-0 rounded-full bg-primary-accent/10 border border-primary-accent/30 px-2 py-0.5 text-xs font-semibold text-primary-accent">{r.score.toFixed(4)}</div>
              </div>
              <p className="mt-2 text-sm text-text-primary leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && query && !busy && (
        <p className="text-sm text-text-secondary">No vectors matched — ingest documents via HiveKnowledge first.</p>
      )}
    </div>
  );
}

function AboutPanel() {
  const specs = [
    ["Index type", "HNSW (Hierarchical Navigable Small World)"],
    ["Similarity metric", "Cosine similarity"],
    ["Embedding dimensions", "1536 (text-embedding-ada-002 compatible)"],
    ["Hybrid search", "Dense + sparse BM25 fusion (RRF re-ranking)"],
    ["Multi-tenancy", "Namespace isolation per workspace"],
    ["Update semantics", "Append-only; chunk tombstone on document delete"],
    ["Batch ingest", "Up to 10,000 chunks per request"],
    ["Max query results", "100 (default: 10)"],
  ];
  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">HiveVector is the semantic storage backbone powering HiveKnowledge RAG, HiveMemory long-term recall, and HiveAgents tool-use context retrieval. It maintains a unified HNSW index that all platform services share.</p>
      <div className="rounded-xl border border-border bg-surface/40 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {specs.map(([k, v]) => (
              <tr key={k} className="border-b border-border last:border-none">
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary w-48">{k}</td>
                <td className="px-4 py-3 text-text-primary">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Architecture</h2>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          <li><span className="font-semibold text-text-primary">Write path:</span> Documents → chunker → embedding model → HNSW index (pgvector). Async with back-pressure.</li>
          <li><span className="font-semibold text-text-primary">Read path:</span> Query → embedding → ANN scan → optional BM25 hybrid → reranker → results.</li>
          <li><span className="font-semibold text-text-primary">Namespace routing:</span> Every tenant gets a logical namespace; cross-namespace search requires explicit join permission.</li>
          <li><span className="font-semibold text-text-primary">Observability:</span> All queries are traced via OpenTelemetry and surfaced in HiveObservatory.</li>
        </ul>
      </div>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["search", "Vector Search", Search],
  ["about", "Architecture", GitBranch],
];

export default function HiveVectorPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("search");
  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveVector™ · Tier 1</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Unified vector index — HNSW semantic search across the entire data mesh</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveVector is the semantic backbone of the platform. All documents, memories, and agent contexts are indexed here. Search by natural language; results are ranked by cosine similarity and optionally fused with BM25 sparse retrieval.</p>
      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === "search" && <SearchPanel online={online} />}
      {tab === "about" && <AboutPanel />}
    </main>
  );
}
