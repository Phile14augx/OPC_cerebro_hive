"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "fleet" | "memory" | "events";
const AGENTS = [
  { name: "security-sentinel-prod", purpose: "Monitor SIEM events, triage alerts, auto-escalate P1s", status: "active", uptime: "14d 6h", events: 2841, model: "claude-sonnet-5", memory: "128 items" },
  { name: "finance-reconciler-nightly", purpose: "Reconcile GL accounts, flag variances, draft management report", status: "active", uptime: "7d 2h", events: 312, model: "claude-opus-5", memory: "44 items" },
  { name: "customer-success-monitor", purpose: "Track churn signals, send proactive outreach, log CRM notes", status: "active", uptime: "21d 11h", events: 1094, model: "claude-sonnet-5", memory: "201 items" },
  { name: "compliance-watchdog", purpose: "Audit policy changes, collect evidence, generate compliance deltas", status: "paused", uptime: "0d", events: 890, model: "claude-sonnet-5", memory: "78 items" },
];
const EVENTS = [
  { agent: "security-sentinel-prod", event: "P2 alert triaged — false positive, closed", time: "3min ago" },
  { agent: "finance-reconciler-nightly", event: "Variance detected: OPEX overage $48K in Jul — flagged for CFO review", time: "1h ago" },
  { agent: "customer-success-monitor", event: "Churn risk: Meridian Financial (score 0.84) — drafted outreach email", time: "2h ago" },
  { agent: "security-sentinel-prod", event: "P1 alert escalated to on-call via PagerDuty: brute force attempt detected", time: "6h ago" },
  { agent: "customer-success-monitor", event: "NPS survey response logged in CerebroCRM — sentiment: positive", time: "8h ago" },
];
export default function CerebroAgentPage() {
  const [tab, setTab] = useState<Tab>("fleet");
  const [selected, setSelected] = useState(AGENTS[0]);
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroAgent™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Persistent agent fleet — continuous digital workers with long-term memory</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroAgent manages stateful, persistent autonomous agents that run continuously — monitoring event streams, maintaining long-term memory, and proactively executing tasks over days or weeks without human intervention.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["fleet","memory","events"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="fleet" && (
        <div className="mt-6 space-y-2">
          {AGENTS.map(a=>(
            <button key={a.name} onClick={()=>setSelected(a)} className={`w-full rounded-xl border p-4 text-left transition-colors ${selected.name===a.name?"border-primary-accent/50 bg-primary-accent/5":"border-border bg-surface/40 hover:bg-surface-elevated/40"}`}>
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-mono font-semibold text-text-primary">{a.name}</p><p className="mt-0.5 text-xs text-text-secondary">{a.purpose}</p></div>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold shrink-0 ${a.status==="active"?"border-primary-accent/40 text-primary-accent bg-primary-accent/10":"border-border text-text-secondary"}`}>{a.status}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-secondary">
                <span>Uptime: <span className="font-bold text-text-primary">{a.uptime}</span></span>
                <span>Events: <span className="font-bold text-text-primary">{a.events.toLocaleString()}</span></span>
                <span>Model: <span className="font-mono text-primary-accent">{a.model}</span></span>
                <span>Memory: <span className="font-bold text-text-primary">{a.memory}</span></span>
              </div>
            </button>
          ))}
        </div>
      )}
      {tab==="memory" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Viewing long-term memory for: <span className="font-semibold text-text-primary font-mono">{selected.name}</span>. Memory is stored in HiveVector and retrieved via semantic similarity at every agent step.</p>
          <div className="space-y-2">
            {[
              ["fact","Meridian Financial is CerebroHive's largest customer by ARR ($1.2M/yr)","High-importance"],
              ["fact","SIEM alert threshold: P1 = score > 0.90, P2 = score 0.70–0.90","Rule"],
              ["event","Jul 24: Detected and closed 12 false positive P2 alerts in batch","Recent"],
              ["fact","On-call rotation: Alex Torres week of Jul 21","Operational"],
              ["preference","CFO prefers variance reports as executive bullets, not tables","Style"],
            ].map(([type,content,label],i)=>(
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4">
                <div className="mt-1 flex-shrink-0 rounded border border-border px-1.5 py-0.5 text-xs font-mono text-text-secondary">{type}</div>
                <p className="flex-1 text-sm text-text-primary">{content}</p>
                <span className="text-xs text-text-secondary shrink-0">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="events" && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-text-secondary">Recent events across all active agents. Every action is logged to the audit trail in HiveConsole.</p>
          {EVENTS.map((e,i)=>(
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-accent shrink-0" />
              <div className="flex-1 min-w-0"><p className="font-mono text-xs text-primary-accent">{e.agent}</p><p className="mt-0.5 text-sm text-text-primary">{e.event}</p></div>
              <p className="text-xs text-text-secondary shrink-0">{e.time}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
