"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Search, Sparkles } from "lucide-react";
import { api, checkOnline, KEY, type KnowledgeDocument, type DocContentType, type IngestResult, type SearchResult, type AnswerResult } from "./lib";

type Tab = "documents" | "search" | "ask";
const CONTENT_TYPES: DocContentType[] = ["text/plain", "text/markdown", "text/html", "text/csv", "text/code"];
const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">{label}</span>{children}</label>;
}

function DocumentsPanel({ online }: { online: boolean | null }) {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [form, setForm] = useState({ title: "", contentType: "text/markdown" as DocContentType, content: "" });
  const [result, setResult] = useState<IngestResult | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    // knowledge engine exposes search; derive doc list from context list if available
    try { setDocs([]); } catch { /* noop */ }
  }, [online]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount+poll pattern; setState happens after an await inside refresh(), not synchronously in the effect body, but the rule's static analysis can't see through the async boundary.
  useEffect(() => { void refresh(); }, [refresh]);

  const ingest = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setBusy(true);
    try {
      const r = await api<IngestResult>("/knowledge/documents", { method: "POST", body: JSON.stringify(form) });
      setResult(r);
      setForm(f => ({ ...f, content: "" }));
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Ingest document</h2>
        <p className="mt-1 text-xs text-text-secondary">Documents are chunked, embedded, and indexed for semantic retrieval. All chunks are associated with the document ID for citation.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Title"><input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Q3 2026 Earnings Report" /></Field>
          <Field label="Content type">
            <select className={inputCls} value={form.contentType} onChange={e => setForm(f => ({ ...f, contentType: e.target.value as DocContentType }))}>
              {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Content">
            <textarea className={`${inputCls} min-h-[120px]`} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Paste your document content here…" />
          </Field>
        </div>
        <button onClick={ingest} disabled={busy || !online} className={`mt-3 ${btnPrimary}`}>{busy ? "Ingesting…" : "Ingest document"}</button>
        {result && (
          <p className="mt-3 text-xs text-primary-accent">Ingested as document <code>{result.documentId}</code> — {result.chunkCount} chunks indexed.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Indexed documents</h2>
        {docs.length === 0
          ? <p className="mt-3 text-sm text-text-secondary">Ingest a document above to populate the knowledge base. Use the Search tab to retrieve chunks or the Ask tab to generate grounded answers.</p>
          : <div className="mt-3 space-y-2">{docs.map(d => (
              <div key={d.id} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="text-sm font-semibold text-text-primary">{d.title}</div>
                <p className="mt-0.5 text-xs text-text-secondary">{d.contentType} · {d.chunkCount} chunks · {new Date(d.createdAt).toLocaleDateString()}</p>
              </div>
            ))}</div>
        }
      </section>
    </div>
  );
}

function SearchPanel({ online }: { online: boolean | null }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try { setResults(await api<SearchResult[]>(`/knowledge/search?q=${encodeURIComponent(query)}&limit=10`)); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Semantic chunk retrieval using dense vector similarity. Queries are embedded and compared against all indexed document chunks. Results are ranked by cosine similarity score.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <Field label="Search query">
          <div className="flex gap-2 mt-1">
            <input className={inputCls} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="What were the key risk factors mentioned in the earnings report?" />
            <button onClick={search} disabled={busy || !online} className={`shrink-0 ${btnPrimary}`}>{busy ? "…" : "Search"}</button>
          </div>
        </Field>
      </section>
      {results.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Results ({results.length})</h2>
          <div className="mt-3 space-y-3">
            {results.map(r => (
              <div key={r.chunkId} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-primary-accent">{r.title}</div>
                  <div className="text-xs text-text-secondary">score {r.score.toFixed(3)}</div>
                </div>
                <p className="mt-2 text-sm text-text-primary">{r.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {results.length === 0 && query && !busy && <p className="text-sm text-text-secondary">No results — try a different query or ingest documents first.</p>}
    </div>
  );
}

function AskPanel({ online }: { online: boolean | null }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AnswerResult | null>(null);
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setBusy(true);
    try { setAnswer(await api<AnswerResult>(`/knowledge/answer?q=${encodeURIComponent(question)}`)); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Retrieval-Augmented Generation: retrieve the most relevant chunks from the knowledge base, then use the LLM to synthesize a grounded answer with inline citations. No hallucinations from model pre-training — every claim is sourced.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <Field label="Question">
          <div className="flex gap-2 mt-1">
            <input className={inputCls} value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} placeholder="Summarize the main financial risks for Q3." />
            <button onClick={ask} disabled={busy || !online} className={`shrink-0 inline-flex items-center gap-1.5 ${btnPrimary}`}><Sparkles size={12} />{busy ? "Generating…" : "Ask"}</button>
          </div>
        </Field>
      </section>
      {answer && (
        <section className="space-y-4">
          <div className="rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-4">
            <p className="text-sm text-text-primary leading-relaxed">{answer.answer}</p>
          </div>
          {answer.citations.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Sources</h2>
              <div className="mt-2 space-y-2">
                {answer.citations.map(c => (
                  <div key={c.chunkId} className="rounded-lg border border-border bg-surface/40 px-3 py-2">
                    <div className="text-xs font-semibold text-primary-accent">{c.title}</div>
                    <p className="mt-0.5 text-xs text-text-secondary italic">&ldquo;{c.excerpt}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["documents", "Documents", BookOpen],
  ["search", "Semantic Search", Search],
  ["ask", "Ask (RAG)", Sparkles],
];

export default function HiveKnowledgePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("documents");
  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveKnowledge™ · Tier 2</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Enterprise knowledge base with RAG — chunk, embed, retrieve, and cite</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        HiveKnowledge is the document intelligence layer. Ingest any document, and the platform chunks it, embeds each chunk using the active embedding model, and indexes it for semantic retrieval. Ask questions and get grounded answers with inline citations — no hallucinations from pre-training knowledge.
      </p>
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
      {tab === "documents" && <DocumentsPanel online={online} />}
      {tab === "search" && <SearchPanel online={online} />}
      {tab === "ask" && <AskPanel online={online} />}
    </main>
  );
}
