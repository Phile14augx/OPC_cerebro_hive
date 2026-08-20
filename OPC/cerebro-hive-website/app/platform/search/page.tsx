"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { API, KEY } from "@/lib/platform-api";


const DEMO_RESULTS = [
  { id: "r1", title: "Q3 2026 Financial Report", snippet: "Revenue grew 18% YoY to $6.8M driven by enterprise expansion. Operating expenses increased 12%…", type: "document", score: 0.94, source: "HiveData" },
  { id: "r2", title: "Finance Agent Run #4821", snippet: "Agent summarized Q3 actuals, identified 3 cost anomalies, and generated executive narrative in 2.1s…", type: "agent_trace", score: 0.87, source: "HiveEvaluation" },
  { id: "r3", title: "GAAP Revenue Recognition Policy", snippet: "Subscription revenue is recognized ratably over the service period. One-time fees recognized at delivery…", type: "policy", score: 0.82, source: "HiveKnowledge" },
  { id: "r4", title: "CerebroFinance journal entry JE-2026-Q3-0041", snippet: "Debit 1000 (Cash) $480,000 / Credit 4000 (Revenue) $480,000 — Meridian Financial Q3 payment…", type: "record", score: 0.79, source: "CerebroFinance" },
];

const TYPE_COLOR: Record<string, string> = {
  document: "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
  agent_trace: "border-purple-400/40 text-purple-400 bg-purple-400/10",
  policy: "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  record: "border-orange-400/40 text-orange-400 bg-orange-400/10",
};

export default function CerebroSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof DEMO_RESULTS>([]);
  const [busy, setBusy] = useState(false);
  const [scope, setScope] = useState<"all" | "documents" | "traces" | "records">("all");

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try {
      const r = await fetch(`${API}/knowledge/search?q=${encodeURIComponent(query)}&limit=10`, { headers: KEY ? { Authorization: `Bearer ${KEY}` } : {} });
      if (r.ok) {
        const data = await r.json() as { chunkId: string; title: string; content: string; score: number }[];
        setResults(data.map(d => ({ id: d.chunkId, title: d.title, snippet: d.content, type: "document", score: d.score, source: "HiveKnowledge" })));
      } else { throw new Error(); }
    } catch {
      setResults(DEMO_RESULTS.filter(r => scope === "all" || r.type === scope || (scope === "documents" && ["document","policy"].includes(r.type))));
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroSearch™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Unified enterprise search — documents, traces, records, and agent outputs</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroSearch indexes everything — documents, agent traces, financial records, support tickets, code, and more — into a single searchable corpus. One query surfaces results across every platform data source ranked by semantic relevance.</p>
      <div className="mt-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(["all","documents","traces","records"] as const).map(s=><button key={s} onClick={()=>setScope(s)} className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors ${scope===s?"border-primary-accent text-primary-accent bg-primary-accent/10":"border-border text-text-secondary hover:text-text-primary"}`}>{s}</button>)}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 rounded-md border border-border bg-surface-elevated/40 px-3 py-2 text-sm text-text-primary" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="Search across all platform data…" />
          <button onClick={search} disabled={busy||!query.trim()} className="inline-flex items-center gap-1.5 rounded-md border border-primary-accent px-4 py-2 text-xs font-semibold text-primary-accent disabled:opacity-40"><Search size={12}/>{busy?"…":"Search"}</button>
        </div>
        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary">{results.length} results</p>
            {results.map(r=>(
              <div key={r.id} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="font-semibold text-text-primary truncate">{r.title}</p><p className="mt-0.5 text-xs text-text-secondary">{r.source}</p></div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${TYPE_COLOR[r.type]}`}>{r.type.replace("_"," ")}</span>
                    <span className="text-xs font-bold text-primary-accent">{r.score.toFixed(3)}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-text-secondary line-clamp-2">{r.snippet}</p>
              </div>
            ))}
          </div>
        )}
        {results.length===0&&!busy&&query&&<p className="text-sm text-text-secondary">No results — try a different query.</p>}
        {!query&&<p className="text-sm text-text-secondary">Search across documents, agent traces, financial records, policies, and more.</p>}
      </div>
    </main>
  );
}
