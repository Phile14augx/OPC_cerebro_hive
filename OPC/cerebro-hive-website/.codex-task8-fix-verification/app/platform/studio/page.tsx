"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "command" | "insights" | "chat";
const RECENT = [
  { action: "Agent run", detail: "finance-reconciler-v2 completed · 2.1s · 1,847 tokens", time: "3min ago", product: "HiveAgents" },
  { action: "Document ingested", detail: "Q3-2026-financials.pdf → HiveKnowledge", time: "18min ago", product: "HiveKnowledge" },
  { action: "Anomaly detected", detail: "API error rate +340% — CerebroInsight alert", time: "2h ago", product: "CerebroInsight" },
  { action: "Workflow triggered", detail: "Monthly Board Pack generation workflow started", time: "3h ago", product: "HiveAutomation" },
  { action: "Compliance report", detail: "SOC 2 evidence collection — 94% complete", time: "4h ago", product: "CerebroCompliance" },
];
const CROSS_METRICS = [
  { label: "Agent runs today", value: "892", change: "+14%", positive: true },
  { label: "Knowledge queries", value: "2,341", change: "+8%", positive: true },
  { label: "Workflow success rate", value: "99.1%", change: "+0.3%", positive: true },
  { label: "Avg AI response time", value: "1.4s", change: "-12%", positive: true },
  { label: "Compliance posture", value: "92%", change: "+4%", positive: true },
  { label: "Open anomalies", value: "2", change: "+2", positive: false },
];
const MESSAGES = [
  { role: "assistant", content: "Hi, I'm your CerebroHive AI copilot. I have cross-product access to all your platform data. What would you like to know?" },
  { role: "user", content: "What are the top issues I should know about today?" },
  { role: "assistant", content: "Based on your platform data, here are the 3 most important items for today:\n\n1. **API error rate spike (+340%)** detected by CerebroInsight at 22:15 yesterday — the alert is still open. Likely related to the hive-knowledge-ingest service that went OutOfSync in HiveDeploy.\n\n2. **CerebroCompliance™ seat limit reached** — 5/5 seats used. Your license for this product expires 2026-09-30. Consider upgrading before renewal.\n\n3. **Finance reconciler variance** — the nightly agent flagged $48K OPEX overage in July that needs CFO review.\n\nShall I take action on any of these?" },
];
export default function CerebroStudioPage() {
  const [tab, setTab] = useState<Tab>("command");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const [typing, setTyping] = useState(false);
  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages(m=>[...m, userMsg]);
    setInput("");
    setTyping(true);
    await new Promise(r=>setTimeout(r,900));
    setMessages(m=>[...m, { role: "assistant", content: `Analyzing your request across all connected platform products...\n\nBased on data from HiveAgents, CerebroFinance, HiveObservatory, and CerebroInsight: I've identified the relevant context. Here's my analysis:\n\n${input.length > 30 ? "This is a complex query requiring cross-product synthesis. I'm pulling data from multiple sources and will provide a comprehensive answer momentarily." : "I've processed your request. The relevant platform data shows normal operating conditions with the exceptions already flagged in your morning summary."}` }]);
    setTyping(false);
  };
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroStudio™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Unified command center — cross-product intelligence, AI copilot, workspaces</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroStudio is the single pane of glass for the entire CerebroHive platform. Monitor activity across all 50 products, query your data in natural language, and interact with an AI copilot that has context across every system.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["command","insights","chat"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="command" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Recent platform activity across all products</p>
          <div className="space-y-2">
            {RECENT.map((e,i)=>(
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex-1 min-w-0"><p className="font-semibold text-text-primary">{e.action}</p><p className="mt-0.5 text-xs text-text-secondary truncate">{e.detail}</p></div>
                <div className="text-right shrink-0"><p className="text-xs text-text-secondary">{e.time}</p><p className="mt-0.5 text-xs font-semibold text-primary-accent">{e.product}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="insights" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Cross-product KPIs — updated every 5 minutes</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CROSS_METRICS.map(m=>(
              <div key={m.label} className="rounded-xl border border-border bg-surface/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{m.label}</p>
                <p className="mt-2 text-2xl font-bold text-primary-accent">{m.value}</p>
                <p className={`mt-0.5 text-xs font-semibold ${m.positive?"text-primary-accent":"text-red-400"}`}>{m.change} vs yesterday</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="chat" && (
        <div className="mt-6 space-y-4">
          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.role==="user"?"justify-end":""}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role==="user"?"bg-primary-accent/10 border border-primary-accent/30 text-text-primary":"bg-surface/40 border border-border text-text-secondary"}`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {typing&&<div className="flex"><div className="rounded-2xl border border-border bg-surface/40 px-4 py-3 text-sm text-text-secondary">Thinking…</div></div>}
          </div>
          <div className="flex gap-2">
            <input className="flex-1 rounded-md border border-border bg-surface-elevated/40 px-3 py-2 text-sm text-text-primary" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything about your platform…" />
            <button onClick={send} disabled={typing||!input.trim()} className="rounded-md border border-primary-accent px-4 py-2 text-xs font-semibold text-primary-accent disabled:opacity-40">Send</button>
          </div>
        </div>
      )}
    </main>
  );
}
