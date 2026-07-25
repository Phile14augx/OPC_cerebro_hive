"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "models" | "deployments" | "monitoring";
const MODEL_REGISTRY = [
  { name: "claude-opus-5", provider: "Anthropic", type: "Foundation LLM", version: "1.0", status: "production", rps: 42, latencyP95: "2.1s", costPerM: "$15/$75" },
  { name: "claude-sonnet-5", provider: "Anthropic", type: "Foundation LLM", version: "1.0", status: "production", rps: 128, latencyP95: "0.9s", costPerM: "$3/$15" },
  { name: "text-embedding-3-large", provider: "OpenAI", type: "Embedding", version: "latest", status: "production", rps: 500, latencyP95: "120ms", costPerM: "$0.13/-" },
  { name: "llama-3.1-70b-instruct", provider: "Self-hosted", type: "Open weight", version: "3.1", status: "staging", rps: 18, latencyP95: "3.4s", costPerM: "~$0.80/$0.80" },
];
const DEPLOYMENTS = [
  { agent: "finance-reconciler-v2", model: "claude-opus-5", replicas: 3, traffic: "100%", canary: false, health: "healthy", cpu: "34%", mem: "2.1GB" },
  { agent: "knowledge-ingest-worker", model: "text-embedding-3-large", replicas: 5, traffic: "100%", canary: false, health: "healthy", cpu: "61%", mem: "4.8GB" },
  { agent: "compliance-sentinel", model: "claude-sonnet-5", replicas: 2, traffic: "90%", canary: true, health: "healthy", cpu: "22%", mem: "1.6GB" },
];
export default function HiveOpsPage() {
  const [tab, setTab] = useState<Tab>("models");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveOps™ · Tier 3</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">MLOps &amp; LLMOps — model registry, canary deployments, agent SRE</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveOps is the operational nerve center for AI infrastructure. It manages the model registry, routes inference traffic across providers, orchestrates canary rollouts, and runs automated A/B evaluation to select the best model per agent task.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["models","deployments","monitoring"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="models" && (
        <div className="mt-6 space-y-2">
          {MODEL_REGISTRY.map(m=>(
            <div key={m.name} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-mono font-semibold text-text-primary">{m.name}</p><p className="mt-0.5 text-xs text-text-secondary">{m.provider} · {m.type} · v{m.version}</p></div>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${m.status==="production"?"border-primary-accent/40 text-primary-accent bg-primary-accent/10":"border-yellow-400/40 text-yellow-400 bg-yellow-400/10"}`}>{m.status}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-secondary">
                <span>RPS: <span className="font-bold text-text-primary">{m.rps}</span></span>
                <span>P95: <span className="font-bold text-text-primary">{m.latencyP95}</span></span>
                <span>Cost/1M: <span className="font-bold text-text-primary font-mono">{m.costPerM}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="deployments" && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-text-secondary">Canary deployments split traffic between old and new model versions. A/B evaluation runs for 24h before full promotion.</p>
          {DEPLOYMENTS.map(d=>(
            <div key={d.agent} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-mono font-semibold text-text-primary">{d.agent}</p><p className="mt-0.5 text-xs text-text-secondary">Model: <span className="text-primary-accent">{d.model}</span> · {d.replicas} replicas · {d.traffic} traffic</p></div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.canary&&<span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2 py-0.5 text-xs font-semibold text-yellow-400">canary</span>}
                  <div className="h-2 w-2 rounded-full bg-primary-accent" />
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                <span>CPU: <span className="font-bold text-text-primary">{d.cpu}</span></span>
                <span>Mem: <span className="font-bold text-text-primary">{d.mem}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="monitoring" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">HiveOps monitors model quality continuously via automated eval harness. Alerts fire on quality degradation, latency regressions, or cost spikes.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Avg eval score","0.91 / 1.0"],["P95 latency","1.1s"],["Cost/run (30d avg)","$0.048"],["Error rate","0.03%"]].map(([k,v])=>(
              <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className="mt-2 text-xl font-bold text-primary-accent">{v}</p></div>
            ))}
          </div>
          {[["Quality degradation alert","Fires when eval score drops > 0.05 from 7-day rolling average"],["Latency regression alert","Fires when P95 exceeds 110% of model's established baseline"],["Cost spike alert","Fires when hourly spend exceeds 200% of the same hour prior week"],["Drift detection","Statistical test on model output distribution vs. reference set every 6h"]].map(([name,desc])=>(
            <div key={String(name)} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4"><div className="mt-0.5 h-2 w-2 rounded-full bg-primary-accent shrink-0" /><div><p className="font-semibold text-text-primary">{name}</p><p className="mt-0.5 text-xs text-text-secondary">{desc}</p></div></div>
          ))}
        </div>
      )}
    </main>
  );
}
