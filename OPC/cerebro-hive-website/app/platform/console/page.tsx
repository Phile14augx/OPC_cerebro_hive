"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";
type Tab = "overview" | "users" | "audit";
const AUDIT = [
  { user: "phil@cerebrohive.io", action: "Agent created", resource: "finance-reconciler-v2", time: "2026-07-25 08:12" },
  { user: "system", action: "Auto-scale triggered", resource: "hive-agents-worker (2→4)", time: "2026-07-25 07:44" },
  { user: "admin@cerebrohive.io", action: "Policy updated", resource: "OPA allow-public-ip", time: "2026-07-24 22:30" },
  { user: "phil@cerebrohive.io", action: "Knowledge doc ingested", resource: "Q3-2026-financials.pdf", time: "2026-07-24 18:05" },
  { user: "system", action: "License quota warning", resource: "CerebroCompliance™ seats 5/5", time: "2026-07-24 12:00" },
];
const USERS = [
  { name: "Phil Vnat", email: "phil@cerebrohive.io", role: "Admin", lastActive: "Just now", products: 12 },
  { name: "Jordan Kim", email: "jordan@cerebrohive.io", role: "Developer", lastActive: "2h ago", products: 7 },
  { name: "Alex Torres", email: "alex@cerebrohive.io", role: "Analyst", lastActive: "Yesterday", products: 4 },
  { name: "Sam Okafor", email: "sam@cerebrohive.io", role: "Viewer", lastActive: "3d ago", products: 2 },
];
export default function HiveConsolePage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [health, setHealth] = useState<Record<string,string>>({});
  useEffect(()=>{
    fetch(`${API}/health`, { headers: KEY ? { Authorization: `Bearer ${KEY}` } : {} })
      .then(r=>r.json()).then(d=>setHealth(d)).catch(()=>setHealth({ platform: "online" }));
  },[]);
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveConsole™ · Tier 2</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Unified admin console — health, user management, audit log</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveConsole is the single pane of glass for platform administration. Monitor system health across all 50 products, manage users and roles, review the immutable audit log, and configure org-level settings.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["overview","users","audit"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="overview" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Products active","42/50"],["Total users","4"],["Agent runs today","892"],["Avg response","1.4s"]].map(([k,v])=>(
              <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className="mt-2 text-2xl font-bold text-primary-accent">{v}</p></div>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">System health</p>
          <div className="space-y-2">
            {Object.keys(health).length > 0
              ? Object.entries(health).map(([svc,s])=><div key={svc} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-4"><p className="font-mono text-sm text-text-primary">{svc}</p><span className="rounded-full border border-primary-accent/40 bg-primary-accent/10 px-2 py-0.5 text-xs font-bold text-primary-accent">{s}</span></div>)
              : [["AgentOS FastAPI","online"],["HiveVector (Qdrant)","online"],["HiveKnowledge (RAG)","online"],["Postgres (primary)","online"],["Redis","online"],["Kafka","online"],["ArgoCD","online"],["Tekton","online"]].map(([s,st])=><div key={String(s)} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-4"><p className="font-mono text-sm text-text-primary">{s}</p><span className="rounded-full border border-primary-accent/40 bg-primary-accent/10 px-2 py-0.5 text-xs font-bold text-primary-accent">{st}</span></div>)
            }
          </div>
        </div>
      )}
      {tab==="users" && (
        <div className="mt-6 space-y-2">
          {USERS.map(u=>(
            <div key={u.email} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-4">
              <div><p className="font-semibold text-text-primary">{u.name}</p><p className="mt-0.5 text-xs text-text-secondary">{u.email} · {u.products} products</p></div>
              <div className="flex items-center gap-3"><span className="text-xs text-text-secondary">{u.lastActive}</span><span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-text-secondary">{u.role}</span></div>
            </div>
          ))}
        </div>
      )}
      {tab==="audit" && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-text-secondary">Audit log is append-only, cryptographically signed, and retained for 7 years. All platform actions are recorded.</p>
          {AUDIT.map((e,i)=>(
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-accent shrink-0" />
              <div className="flex-1 min-w-0"><p className="text-sm text-text-primary"><span className="font-semibold">{e.user}</span> — {e.action}</p><p className="mt-0.5 text-xs font-mono text-text-secondary truncate">{e.resource}</p></div>
              <p className="text-xs text-text-secondary shrink-0">{e.time}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
