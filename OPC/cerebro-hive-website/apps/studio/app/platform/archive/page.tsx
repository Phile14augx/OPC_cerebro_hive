"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Search, Sparkles } from "lucide-react";
import {
  api, checkOnline, KEY,
  type KnowledgeDocument, type DocContentType, type IngestResult, type SearchResult, type AnswerResult,
  type Insight, type HubAnalytics,
} from "./lib";

type Tab = "documents" | "ask" | "insights";

const CONTENT_TYPES: DocContentType[] = ["text/plain", "text/markdown", "text/html", "text/csv", "text/code"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary";

function DocumentsPanel({ online }: { online: boolean | null }) {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [form, setForm] = useState({ title: "", contentType: "text/plain" as DocContentType, content: "" });
  const [busy, setBusy] = useState(false);
  const [lastIngest, setLastIngest] = useState<IngestResult | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setDocs((await api<{ documents: KnowledgeDocument[] }>("/v1/knowledge/documents")).documents); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 7000); return () => clearInterval(id); }, [refresh]);

  const ingest = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setBusy(true);
    try {
      const result = await api<IngestResult>("/v1/knowledge/documents", { method: "POST", body: JSON.stringify(form) });
      setLastIngest(result);
      setForm(f => ({ ...f, title: "", content: "" }));
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const statusColor: Record<KnowledgeDocument["status"], string> = { uploaded: "text-text-secondary", parsed: "text-yellow-400", indexed: "text-primary-accent", failed: "text-red-400" };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Ingest a document</h2>
        <p className="mt-1 text-xs text-text-secondary">Runs the real pipeline: chunk → embed → entity-extract → graph-link → index.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Title"><input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Q3 onboarding playbook" /></Field>
          <Field label="Content type"><select className={inputCls} value={form.contentType} onChange={e => setForm(f => ({ ...f, contentType: e.target.value as DocContentType }))}>{CONTENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}</select></Field>
        </div>
        <div className="mt-3">
          <Field label="Content">
            <textarea className={`${inputCls} min-h-[120px]`} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Paste text, markdown, HTML, CSV, or code…" />
          </Field>
        </div>
        <button onClick={ingest} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Ingesting…" : "Ingest document"}
        </button>
        {lastIngest && (
          <p className="mt-2 text-xs text-text-secondary">
            Indexed &quot;{lastIngest.document.title}&quot; into {lastIngest.chunks} chunks, extracted {lastIngest.entities} entities.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Documents ({docs.length})</h2>
        <div className="mt-3 space-y-2">
          {docs.map(d => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/40 p-4">
              <div>
                <div className="text-sm font-semibold text-text-primary">{d.title}</div>
                <p className="mt-0.5 text-xs text-text-secondary">{d.contentType} · {d.rawSize.toLocaleString()} bytes · {d.source}</p>
              </div>
              <div className={`text-xs font-semibold uppercase ${statusColor[d.status]}`}>{d.status}</div>
            </div>
          ))}
          {docs.length === 0 && <p className="text-sm text-text-secondary">No documents ingested yet.</p>}
        </div>
      </section>
    </div>
  );
}

function AskPanel({ online }: { online: boolean | null }) {
  const [mode, setMode] = useState<"search" | "answer">("answer");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);

  const run = async () => {
    if (!query.trim() || !online) return;
    setBusy(true);
    setSearchResult(null); setAnswerResult(null);
    try {
      if (mode === "search") setSearchResult(await api<SearchResult>("/v1/knowledge/search", { method: "POST", body: JSON.stringify({ query, graphExpand: true }) }));
      else setAnswerResult(await api<AnswerResult>("/v1/knowledge/answer", { method: "POST", body: JSON.stringify({ question: query }) }));
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Query the knowledge fabric</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Field label="Mode">
            <select className={inputCls} value={mode} onChange={e => setMode(e.target.value as "search" | "answer")}>
              <option value="answer">Grounded answer (RAG)</option>
              <option value="search">Hybrid search (vector + keyword + graph)</option>
            </select>
          </Field>
          <div className="flex-1">
            <Field label="Question or query"><input className={inputCls} value={query} onChange={e => setQuery(e.target.value)} placeholder="What did we ship in the onboarding playbook?" /></Field>
          </div>
        </div>
        <button onClick={run} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Thinking…" : "Ask"}
        </button>
      </section>

      {answerResult && (
        <section className="rounded-xl border border-border bg-surface/40 p-4">
          <h3 className="text-sm font-semibold text-text-primary">Answer</h3>
          <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">{answerResult.answer}</p>
          {answerResult.citations.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-text-secondary">
              {answerResult.citations.map((c, i) => <li key={i}>[{i + 1}] {c.title} — chunk #{c.chunkSeq}</li>)}
            </ul>
          )}
        </section>
      )}

      {searchResult && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Hits ({searchResult.hits.length})</h3>
          {searchResult.hits.map(h => (
            <div key={h.chunkId} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="font-semibold text-text-primary">{h.documentTitle} #{h.seq}</span>
                <span>score {h.score.toFixed(3)} · via {h.via.join(", ") || "none"}</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{h.text}</p>
            </div>
          ))}
          {searchResult.entities.length > 0 && <p className="text-xs text-text-secondary">Related entities: {searchResult.entities.join(", ")}</p>}
        </section>
      )}
    </div>
  );
}

function InsightsPanel({ online }: { online: boolean | null }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [analytics, setAnalytics] = useState<HubAnalytics | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try {
      setInsights(await api<Insight[]>("/v1/hub/insights"));
    } catch { /* noop */ }
    try { setAnalytics(await api<HubAnalytics>("/v1/hub/analytics")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 8000); return () => clearInterval(id); }, [refresh]);

  const generate = async () => {
    setBusy(true);
    try { await api("/v1/hub/insights/generate", { method: "POST" }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };
  const discover = async () => {
    setBusy(true);
    try { await api("/v1/hub/relationships/discover", { method: "POST" }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const kindColor: Record<Insight["kind"], string> = { trend: "text-primary-accent", anomaly: "text-red-400", recommendation: "text-yellow-400", forecast: "text-sky-400", relationship: "text-violet-400" };

  return (
    <div className="mt-6 space-y-6">
      {analytics && (
        <section className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface/40 p-3 text-xs"><div className="text-text-secondary">Documents indexed</div><div className="mt-1 text-lg font-semibold text-text-primary">{analytics.knowledge.indexed}/{analytics.knowledge.documents}</div></div>
          <div className="rounded-xl border border-border bg-surface/40 p-3 text-xs"><div className="text-text-secondary">Executions</div><div className="mt-1 text-lg font-semibold text-text-primary">{analytics.executions.completed}/{analytics.executions.total}</div></div>
          <div className="rounded-xl border border-border bg-surface/40 p-3 text-xs"><div className="text-text-secondary">AI calls</div><div className="mt-1 text-lg font-semibold text-text-primary">{analytics.ai.calls}</div></div>
          <div className="rounded-xl border border-border bg-surface/40 p-3 text-xs"><div className="text-text-secondary">AI cost</div><div className="mt-1 text-lg font-semibold text-text-primary">${analytics.ai.costUsd.toFixed(2)}</div></div>
        </section>
      )}

      <section className="flex gap-2">
        <button onClick={generate} disabled={busy || !online} className="rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40 inline-flex items-center gap-1.5"><Sparkles size={12} /> Generate insights</button>
        <button onClick={discover} disabled={busy || !online} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary disabled:opacity-40">Discover relationships</button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Insights ({insights.length})</h2>
        <div className="mt-3 space-y-2">
          {insights.map(i => (
            <div key={i.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-text-primary">{i.title}</div>
                <span className={`text-xs font-semibold uppercase ${kindColor[i.kind]}`}>{i.kind} · {(i.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{i.body}</p>
            </div>
          ))}
          {insights.length === 0 && <p className="text-sm text-text-secondary">No insights generated yet.</p>}
        </div>
      </section>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number; className?: string }>][] = [
  ["documents", "Documents", FileText],
  ["ask", "Ask", Search],
  ["insights", "Insights", Sparkles],
];

export default function CerebroArchivePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("documents");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroArchive™</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Ingest, search, and reason over your organization&apos;s knowledge</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        CerebroArchive is the console over CerebroHive&apos;s Knowledge Fabric and Intelligence Hub: real document
        ingestion (chunk → embed → entity-extract → graph-link → index), hybrid vector+keyword+graph search with
        citations, grounded RAG answers, and cross-product analytics and insight generation.
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "documents" && <DocumentsPanel online={online} />}
      {tab === "ask" && <AskPanel online={online} />}
      {tab === "insights" && <InsightsPanel online={online} />}
    </main>
  );
}
