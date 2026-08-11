"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, TrendingUp, MessageSquare } from "lucide-react";

type Tab = "pipeline" | "accounts" | "copilot";
type Stage = "prospect" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

const STAGE_COLOR: Record<Stage, string> = {
  prospect: "border-border text-text-secondary",
  qualified: "border-blue-400/40 text-blue-400 bg-blue-400/10",
  proposal: "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  negotiation: "border-orange-400/40 text-orange-400 bg-orange-400/10",
  closed_won: "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
  closed_lost: "border-red-500/40 text-red-400 bg-red-500/10",
};

const DEALS = [
  { id: "d1", company: "Meridian Financial", value: 480000, stage: "negotiation" as Stage, probability: 72, owner: "Sarah Chen", nextAction: "Send revised contract by Tuesday" },
  { id: "d2", company: "Apex Logistics", value: 230000, stage: "proposal" as Stage, probability: 51, owner: "Marcus Hill", nextAction: "Demo follow-up call Thursday" },
  { id: "d3", company: "Solaris Energy", value: 1200000, stage: "qualified" as Stage, probability: 34, owner: "Sarah Chen", nextAction: "Technical evaluation kickoff" },
  { id: "d4", company: "Vantage Health", value: 95000, stage: "closed_won" as Stage, probability: 100, owner: "James Park", nextAction: "Kickoff scheduled" },
  { id: "d5", company: "CoreTech Inc", value: 320000, stage: "prospect" as Stage, probability: 15, owner: "Marcus Hill", nextAction: "Outbound sequence day 3" },
];

const ACCOUNTS = [
  { id: "a1", name: "Meridian Financial", industry: "Finance", arr: 480000, health: 87, contacts: 5, lastActivity: "2 days ago" },
  { id: "a2", name: "Vantage Health", industry: "Healthcare", arr: 95000, health: 94, contacts: 3, lastActivity: "Today" },
  { id: "a3", name: "GlobalShip Corp", industry: "Logistics", arr: 740000, health: 61, contacts: 8, lastActivity: "1 week ago" },
  { id: "a4", name: "NexGen Pharma", industry: "Pharma", arr: 1100000, health: 78, contacts: 12, lastActivity: "3 days ago" },
];

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

function PipelinePanel() {
  const totalPipeline = DEALS.filter(d => !["closed_won", "closed_lost"].includes(d.stage)).reduce((s, d) => s + d.value * d.probability / 100, 0);
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Weighted Pipeline</p><p className="mt-2 text-2xl font-bold text-primary-accent">${(totalPipeline / 1000).toFixed(0)}K</p></div>
        <div className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Open Deals</p><p className="mt-2 text-2xl font-bold text-text-primary">{DEALS.filter(d => d.stage !== "closed_won" && d.stage !== "closed_lost").length}</p></div>
        <div className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Avg Win Probability</p><p className="mt-2 text-2xl font-bold text-text-primary">{Math.round(DEALS.filter(d => !["closed_won","closed_lost"].includes(d.stage)).reduce((s,d) => s + d.probability, 0) / 3)}%</p></div>
      </div>
      <div className="space-y-2">
        {DEALS.map(d => (
          <div key={d.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-text-primary">{d.company}</span>
                <span className="ml-2 text-sm font-bold text-primary-accent">${(d.value / 1000).toFixed(0)}K</span>
              </div>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STAGE_COLOR[d.stage]}`}>{d.stage.replace("_", " ")}</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
              <span>{d.probability}% probability</span>
              <span>·</span>
              <span>{d.owner}</span>
            </div>
            <p className="mt-1.5 text-xs text-text-secondary">→ {d.nextAction}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountsPanel() {
  return (
    <div className="mt-6 space-y-4">
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-elevated/40">
            <tr>{["Account", "Industry", "ARR", "Health", "Contacts", "Last Activity"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr>
          </thead>
          <tbody>
            {ACCOUNTS.map(a => (
              <tr key={a.id} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                <td className="px-3 py-2 font-semibold text-text-primary">{a.name}</td>
                <td className="px-3 py-2 text-text-secondary">{a.industry}</td>
                <td className="px-3 py-2 font-bold text-primary-accent">${(a.arr / 1000).toFixed(0)}K</td>
                <td className="px-3 py-2"><span className={`font-bold ${a.health >= 80 ? "text-primary-accent" : a.health >= 60 ? "text-yellow-400" : "text-red-400"}`}>{a.health}</span></td>
                <td className="px-3 py-2 text-text-secondary">{a.contacts}</td>
                <td className="px-3 py-2 text-text-secondary">{a.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CopilotPanel() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm your Deal Copilot. Ask me about pipeline risk, account health, next best actions, or have me draft an email to a prospect." },
  ]);
  const [busy, setBusy] = useState(false);
  const suggestions = ["What deals are at risk this quarter?", "Draft a follow-up email for Meridian Financial", "Which accounts have declining health scores?"];

  const send = (text: string) => {
    const q = text || msg;
    if (!q.trim()) return;
    setChat(c => [...c, { role: "user", text: q }]);
    setMsg(""); setBusy(true);
    setTimeout(() => {
      const replies: Record<string, string> = {
        "What deals are at risk this quarter?": "2 deals show risk signals: Apex Logistics ($230K) has gone dark for 8 days — the champion may have changed roles. GlobalShip Corp ($740K) has a health score of 61, driven by 3 open support tickets unresolved >7 days. Recommend: immediate executive sponsor outreach for both.",
        "Draft a follow-up email for Meridian Financial": "Subject: Revised Agreement + Q4 Implementation Timeline\n\nHi [Champion],\n\nThank you for the productive call on Thursday. As discussed, I've attached the revised contract incorporating the data residency clause for your EU entities.\n\nGiven your Q4 go-live target, the implementation kickoff needs to begin by Oct 15. I've blocked the week of Oct 14 for our delivery team — would that work for your side?\n\nBest,\n[Name]",
        "Which accounts have declining health scores?": "GlobalShip Corp dropped 12 points in 30 days (now 61/100). Primary drivers: 3 unresolved P2 tickets and a 40% drop in API usage suggesting low adoption. Recommended action: schedule a QBR with their VP Engineering this week.",
      };
      setChat(c => [...c, { role: "ai", text: replies[q] || "I've analyzed your CRM data. Pipeline coverage is 2.3x quota with weighted value of $890K. Top risk: 3 deals haven't had activity in 10+ days. Want me to draft re-engagement emails for those accounts?" }]);
      setBusy(false);
    }, 1000);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-3 min-h-[200px]">
        {chat.map((m, i) => (
          <div key={i} className={`rounded-xl p-4 text-sm ${m.role === "user" ? "border border-primary-accent/20 bg-primary-accent/5 ml-8" : "border border-border bg-surface/40"}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">{m.role === "user" ? "You" : "Deal Copilot"}</p>
            <pre className="whitespace-pre-wrap font-sans text-text-primary">{m.text}</pre>
          </div>
        ))}
        {busy && <div className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs text-text-secondary animate-pulse">Analyzing pipeline…</p></div>}
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => <button key={s} onClick={() => send(s)} className="rounded-md border border-border px-2.5 py-1.5 text-xs text-text-secondary hover:border-primary-accent/40 hover:text-primary-accent transition-colors">{s}</button>)}
      </div>
      <div className="flex gap-2">
        <input className={inputCls} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send(msg)} placeholder="Ask about pipeline, accounts, or draft outreach…" />
        <button onClick={() => send(msg)} disabled={busy || !msg.trim()} className={`shrink-0 ${btnPrimary}`}>Send</button>
      </div>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["pipeline", "Pipeline", TrendingUp],
  ["accounts", "Accounts", Users],
  ["copilot", "Deal Copilot", MessageSquare],
];

export default function CerebroCRMPage() {
  const [tab, setTab] = useState<Tab>("pipeline");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroCRM™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Revenue Intelligence CRM — pipeline, account health, Deal Copilot</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroCRM is a Revenue Intelligence platform built on the agent stack. Win probability ML scores every deal, account health scores surface churn risk early, and the Deal Copilot drafts emails, flags at-risk deals, and recommends next best actions.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "pipeline" && <PipelinePanel />}
      {tab === "accounts" && <AccountsPanel />}
      {tab === "copilot" && <CopilotPanel />}
    </main>
  );
}
