"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FolderOpen, Plus, Search, Tag } from "lucide-react";
import { api, checkOnline, type ArchiveDoc, type DocList } from "./lib";

type Tab = "browse" | "create" | "search";

const inputCls =
  "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary =
  "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

const BASE = "/api/v1/modules/archive";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function DocCard({ doc, onDelete }: { doc: ArchiveDoc; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const del = async () => {
    setDeleting(true);
    try { await api(`${BASE}/documents/${doc.id}`, { method: "DELETE" }); onDelete(); }
    catch { /* noop */ } finally { setDeleting(false); }
  };

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-semibold text-text-primary">{doc.title}</div>
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-primary-accent font-semibold">{doc.domain}</span>
            {doc.resource_type && <span className="text-xs text-text-secondary">{doc.resource_type}</span>}
            <span className="text-xs text-text-secondary">v{doc.version}</span>
            {doc.file_type && <span className="text-xs text-text-secondary">.{doc.file_type}</span>}
            {doc.file_size_bytes && (
              <span className="text-xs text-text-secondary">{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
            )}
          </div>
        </div>
        <button
          onClick={del}
          disabled={deleting}
          className="shrink-0 rounded-md border border-red-500/30 px-2 py-1 text-xs text-red-400 hover:border-red-500/60 transition-colors disabled:opacity-40"
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>
      {doc.description && (
        <p className="mt-2 text-xs text-text-secondary line-clamp-2">{doc.description}</p>
      )}
      {doc.tags && doc.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {doc.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface/40 px-2 py-0.5 text-[10px] text-text-secondary">
              <Tag size={9} /> {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-[10px] text-text-secondary">
        {new Date(doc.created_at).toLocaleDateString()} · id: {doc.id.slice(0, 8)}
      </p>
    </div>
  );
}

function BrowsePanel({ online }: { online: boolean | null }) {
  const [list, setList] = useState<DocList | null>(null);
  const [page, setPage] = useState(1);
  const [domain, setDomain] = useState("");

  const refresh = useCallback(async () => {
    if (!online) return;
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (domain) params.set("domain", domain);
    try { setList(await api<DocList>(`${BASE}/documents?${params}`)); } catch { /* noop */ }
  }, [online, page, domain]);

  useEffect(() => { void refresh(); const id = setInterval(refresh, 8000); return () => clearInterval(id); }, [refresh]);

  const totalPages = list ? Math.ceil(list.total / list.page_size) : 1;

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">
        HiveData is the enterprise data archive — store, version, and retrieve any structured or unstructured document. Every record is automatically indexed into the HiveVector layer for semantic retrieval by agents.
      </p>
      <div className="flex items-end gap-2 flex-wrap">
        <div className="w-40">
          <Field label="Filter by domain">
            <input className={inputCls} value={domain} onChange={e => { setDomain(e.target.value); setPage(1); }} placeholder="general" />
          </Field>
        </div>
        <button onClick={() => void refresh()} className={btnPrimary}>Refresh</button>
      </div>
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{list?.total ?? 0} documents</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={btnPrimary}>← Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={btnPrimary}>Next →</button>
          </div>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list?.items.map(doc => (
          <DocCard key={doc.id} doc={doc} onDelete={() => void refresh()} />
        ))}
      </div>
      {list?.items.length === 0 && (
        <p className="text-sm text-text-secondary">No documents in this domain. Ingest one from the Create tab.</p>
      )}
    </div>
  );
}

function CreatePanel({ online, onCreated }: { online: boolean | null; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    domain: "general",
    resource_type: "",
    tags: "",
    is_public: false,
  });
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<ArchiveDoc | null>(null);

  const create = async () => {
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const doc = await api<ArchiveDoc>(`${BASE}/documents`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
          workspace_id: null,
          meta: {},
          source_url: null,
        }),
      });
      setCreated(doc);
      setForm(f => ({ ...f, title: "", description: "", content: "", tags: "" }));
      onCreated();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">
        Ingest a document into the archive. Content is parsed, chunked, embedded, and indexed in the vector layer automatically. Ingested documents are immediately searchable by agents with HiveKnowledge access.
      </p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">New document</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Q3 2026 Board Deck" />
          </Field>
          <Field label="Domain">
            <input className={inputCls} value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} placeholder="finance, hr, ops…" />
          </Field>
          <Field label="Resource type">
            <input className={inputCls} value={form.resource_type} onChange={e => setForm(f => ({ ...f, resource_type: e.target.value }))} placeholder="report, policy, contract…" />
          </Field>
          <Field label="Tags (comma-separated)">
            <input className={inputCls} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="q3, board, confidential" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <input className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief summary of the document" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Content">
              <textarea
                className={`${inputCls} min-h-[160px]`}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Paste the full document text here. It will be chunked and indexed for semantic search."
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input type="checkbox" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))} />
            <span>Public (accessible across all workspaces)</span>
          </label>
        </div>
        <button onClick={create} disabled={busy || !online || !form.title.trim()} className={`inline-flex items-center gap-1.5 ${btnPrimary}`}>
          <Plus size={12} />{busy ? "Ingesting…" : "Ingest document"}
        </button>
        {created && (
          <p className="text-xs text-primary-accent">
            Ingested as <code>{created.id.slice(0, 8)}</code> · domain: {created.domain} · v{created.version}
          </p>
        )}
      </section>
    </div>
  );
}

function SearchPanel({ online }: { online: boolean | null }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArchiveDoc[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try {
      // Archive search endpoint
      const r = await api<{ hits: ArchiveDoc[] } | ArchiveDoc[]>(`${BASE}/search?q=${encodeURIComponent(query)}`);
      setResults(Array.isArray(r) ? r : r.hits ?? []);
    } catch { setResults([]); } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">
        Full-text and semantic search across all archived documents. Results are ranked by relevance using the platform's hybrid retrieval pipeline (dense + BM25).
      </p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <Field label="Search query">
          <div className="flex gap-2 mt-1">
            <input
              className={inputCls}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="board resolution Q3 2026…"
            />
            <button onClick={search} disabled={busy || !online} className={`shrink-0 inline-flex items-center gap-1.5 ${btnPrimary}`}>
              <Search size={12} />{busy ? "…" : "Search"}
            </button>
          </div>
        </Field>
      </section>
      {results.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map(doc => (
            <DocCard key={doc.id} doc={doc} onDelete={() => setResults(r => r.filter(d => d.id !== doc.id))} />
          ))}
        </div>
      )}
      {results.length === 0 && query && !busy && (
        <p className="text-sm text-text-secondary">No results — try a different query or ingest documents first.</p>
      )}
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["browse", "Browse", FolderOpen],
  ["create", "Ingest", Plus],
  ["search", "Search", Search],
];

export default function HiveDataPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("browse");
  const [, setTick] = useState(0);

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link
        href="/platform"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"
      >
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">
        HiveData™ · Tier 2
      </p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">
        Enterprise data archive — ingest, version, and search any document
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        HiveData is the structured and unstructured data layer. Every ingested document is versioned, tagged by domain, and automatically indexed into HiveVector for agent retrieval. Browse by domain, ingest new records, or run hybrid full-text and semantic search across the entire corpus.
      </p>
      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">
          {online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}
        </span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === "browse" && <BrowsePanel online={online} />}
      {tab === "create" && <CreatePanel online={online} onCreated={() => setTick(n => n + 1)} />}
      {tab === "search" && <SearchPanel online={online} />}
    </main>
  );
}
