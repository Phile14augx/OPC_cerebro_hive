"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "explorer" | "keys" | "analytics";
const ENDPOINTS = [
  { method: "POST", path: "/agents", description: "Create a new agent definition", auth: true },
  { method: "GET", path: "/agents", description: "List all agent definitions", auth: true },
  { method: "POST", path: "/runtime/execute", description: "Execute an agent run", auth: true },
  { method: "GET", path: "/runtime/runs/{id}", description: "Get run status and output", auth: true },
  { method: "POST", path: "/knowledge/documents", description: "Ingest a document into the knowledge base", auth: true },
  { method: "GET", path: "/knowledge/search", description: "Semantic search over knowledge base", auth: true },
  { method: "GET", path: "/knowledge/answer", description: "RAG question-answering", auth: true },
  { method: "GET", path: "/observability/summary", description: "Metrics summary across all services", auth: true },
  { method: "GET", path: "/health", description: "Platform health check", auth: false },
];
const METHOD_COLOR: Record<string, string> = {
  GET: "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
  POST: "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  DELETE: "border-red-500/40 text-red-400 bg-red-500/10",
  PATCH: "border-orange-400/40 text-orange-400 bg-orange-400/10",
};
const KEYS = [
  { name: "Production API Key", prefix: "chk_prod_", created: "2026-01-15", lastUsed: "Just now", scopes: ["agents:rw","knowledge:rw","observability:r"] },
  { name: "Development Key", prefix: "chk_dev_", created: "2026-05-01", lastUsed: "2h ago", scopes: ["agents:rw","knowledge:rw"] },
  { name: "CI/CD Pipeline Key", prefix: "chk_ci_", created: "2026-03-10", lastUsed: "8min ago", scopes: ["agents:r","observability:r"] },
];
export default function HiveAPIPage() {
  const [tab, setTab] = useState<Tab>("explorer");
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveAPI™ · Tier 2</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">API management — developer portal, key management, usage analytics</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveAPI is the developer portal and API management layer. Explore the full REST API, manage authentication keys with fine-grained scopes, monitor per-key usage, and access interactive documentation for every platform endpoint.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["explorer","keys","analytics"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="explorer" && (
        <div className="mt-6 space-y-1">
          {ENDPOINTS.map(e=>(
            <div key={e.path}>
              <button onClick={()=>setExpanded(expanded===e.path?null:e.path)} className="w-full flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3 text-left hover:bg-surface-elevated/40 transition-colors">
                <span className={`rounded-md border px-2 py-0.5 font-mono text-xs font-bold w-16 text-center shrink-0 ${METHOD_COLOR[e.method]}`}>{e.method}</span>
                <span className="font-mono text-sm text-text-primary flex-1 min-w-0 truncate">{e.path}</span>
                {!e.auth&&<span className="text-xs text-text-secondary shrink-0">public</span>}
              </button>
              {expanded===e.path&&(
                <div className="ml-3 mr-1 rounded-b-xl border-x border-b border-border bg-surface/20 p-4 -mt-1">
                  <p className="text-xs text-text-secondary mb-2">{e.description}{e.auth&&" · Requires Bearer token"}</p>
                  <pre className="text-xs text-text-secondary font-mono bg-surface-elevated/40 rounded p-3 overflow-auto">{e.method==="POST"?`curl -X POST ${process.env.NEXT_PUBLIC_PLATFORM_API_URL||"http://localhost:8090"}${e.path} \\\n  -H "Authorization: Bearer $HIVE_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{}'`:`curl ${process.env.NEXT_PUBLIC_PLATFORM_API_URL||"http://localhost:8090"}${e.path} \\\n  ${e.auth?'-H "Authorization: Bearer $HIVE_API_KEY"':""}`}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {tab==="keys" && (
        <div className="mt-6 space-y-3">
          {KEYS.map(k=>(
            <div key={k.name} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{k.name}</p><p className="mt-0.5 font-mono text-xs text-text-secondary">{k.prefix}••••••••••••</p></div>
                <p className="text-xs text-text-secondary shrink-0">Last used: {k.lastUsed}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">{k.scopes.map(s=><span key={s} className="rounded-full border border-border px-2 py-0.5 text-xs font-mono text-text-secondary">{s}</span>)}</div>
            </div>
          ))}
          <button className="rounded-md border border-primary-accent px-4 py-2 text-xs font-semibold text-primary-accent">+ Create API Key</button>
        </div>
      )}
      {tab==="analytics" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["Total requests (30d)","1.82M"],["Avg latency","142ms P50"],["Error rate","0.04%"]].map(([k,v])=>(
              <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className="mt-2 text-2xl font-bold text-primary-accent">{v}</p></div>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Top endpoints by request volume</p>
          {[["POST /runtime/execute","48%","876K"],["GET /knowledge/search","22%","400K"],["POST /knowledge/documents","14%","255K"],["GET /runtime/runs/{id}","9%","164K"],["GET /observability/summary","7%","127K"]].map(([ep,pct,count])=>(
            <div key={String(ep)} className="rounded-xl border border-border bg-surface/40 p-3">
              <div className="flex items-center justify-between gap-2 mb-1"><span className="font-mono text-xs text-text-primary">{ep}</span><span className="text-xs font-bold text-primary-accent">{count}</span></div>
              <div className="h-1.5 w-full rounded-full bg-surface-elevated/40"><div className="h-1.5 rounded-full bg-primary-accent" style={{width:pct}} /></div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
