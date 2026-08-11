"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "financials" | "operations" | "copilot";
const ACCOUNTS = [
  { code: "1000", name: "Cash & Equivalents", balance: "$2,841,400", type: "Asset" },
  { code: "1200", name: "Accounts Receivable", balance: "$1,480,000", type: "Asset" },
  { code: "2000", name: "Accounts Payable", balance: "$342,800", type: "Liability" },
  { code: "3000", name: "Common Stock", balance: "$5,000,000", type: "Equity" },
  { code: "4000", name: "Revenue", balance: "$6,812,400", type: "Revenue" },
  { code: "5000", name: "COGS", balance: "$1,842,300", type: "Expense" },
  { code: "6000", name: "Operating Expenses", balance: "$2,890,100", type: "Expense" },
];
const ORDERS = [
  { id: "PO-2026-0441", vendor: "Meridian Supplies", amount: "$84,200", status: "approved", delivery: "2026-08-05", match: "matched" },
  { id: "SO-2026-1812", customer: "BuildRight Corp", amount: "$210,000", status: "fulfilling", delivery: "2026-08-10", match: "pending" },
  { id: "PO-2026-0438", vendor: "TechParts Co", amount: "$22,400", status: "pending", delivery: "2026-08-12", match: "exception" },
  { id: "SO-2026-1809", customer: "HealthSync AI", amount: "$89,000", status: "shipped", delivery: "2026-07-28", match: "matched" },
];
const STATUS_COLOR: Record<string, string> = {
  approved: "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
  fulfilling: "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  pending: "border-border text-text-secondary",
  shipped: "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
};
const MATCH_COLOR: Record<string, string> = {
  matched: "text-primary-accent",
  pending: "text-text-secondary",
  exception: "text-red-400",
};
const AI_RESPONSES = [
  "Based on ERP data, Q3 cash flow is projected to be $1.2M positive with 94% confidence. Primary risk: BuildRight Corp invoice $210K delayed by 2 weeks (per logistics feed).",
  "AI 3-way match completed: PO-2026-0438 flagged as exception — invoice total $23,800 vs. PO amount $22,400. Variance of $1,400 (6.25%). Routing to AP manager for approval.",
  "Demand sensing alert: inventory for SKU-TechParts-2241 at 8 days of supply. Reorder point is 14 days. Auto-generating PO draft for $34,500 — awaiting procurement approval.",
];
export default function CerebroERPPage() {
  const [tab, setTab] = useState<Tab>("financials");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState(false);
  const ask = async () => {
    if (!query.trim()) return;
    setBusy(true);
    await new Promise(r=>setTimeout(r,800));
    setResponse(AI_RESPONSES[Math.floor(Math.random()*AI_RESPONSES.length)]);
    setBusy(false);
  };
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroERP™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">AI-native ERP — financials, order management, demand sensing, 3-way match</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroERP replaces rigid legacy ERPs with an intelligent, self-optimizing system. AI agents handle 3-way matching, exception triage, demand sensing, and cash flow forecasting — routine operations run themselves while finance teams focus on decisions.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["financials","operations","copilot"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="financials" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["Net revenue","$6.81M","+18% YoY"],["Cash position","$2.84M","+$420K MoM"],["EBITDA margin","30.4%","+2.1pp"]].map(([k,v,c])=>(
              <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className="mt-2 text-2xl font-bold text-primary-accent">{v}</p><p className="text-xs font-semibold text-primary-accent">{c}</p></div>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Chart of accounts</p>
          <div className="space-y-1">
            {ACCOUNTS.map(a=>(
              <div key={a.code} className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
                <span className="font-mono text-xs text-text-secondary w-10">{a.code}</span>
                <span className="flex-1 text-sm text-text-primary">{a.name}</span>
                <span className="text-xs text-text-secondary">{a.type}</span>
                <span className="font-bold text-text-primary">{a.balance}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="operations" && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-text-secondary">Purchase and sales orders with AI 3-way match status (PO × GR × Invoice). Exceptions are auto-routed to approvers.</p>
          {ORDERS.map(o=>(
            <div key={o.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-mono font-semibold text-text-primary">{o.id}</p><p className="mt-0.5 text-xs text-text-secondary">{("vendor" in o) ? `Vendor: ${o.vendor}` : `Customer: ${o.customer}`} · Due {o.delivery}</p></div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold text-text-primary`}>{o.amount}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs"><span className="text-text-secondary">3-way match:</span><span className={`font-semibold ${MATCH_COLOR[o.match]}`}>{o.match}</span></div>
            </div>
          ))}
        </div>
      )}
      {tab==="copilot" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Ask the ERP Copilot anything about your operations. It has real-time access to GL, AP/AR, inventory, and order data.</p>
          <div className="flex gap-2">
            <input className="flex-1 rounded-md border border-border bg-surface-elevated/40 px-3 py-2 text-sm text-text-primary" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="e.g. What's our projected cash position for next month?" />
            <button onClick={ask} disabled={busy||!query.trim()} className="rounded-md border border-primary-accent px-4 py-2 text-xs font-semibold text-primary-accent disabled:opacity-40">{busy?"…":"Ask"}</button>
          </div>
          {response&&<div className="rounded-xl border border-border bg-surface/40 p-4 text-sm text-text-secondary">{response}</div>}
          {!response&&!busy&&<div className="space-y-2">{["What are our top 5 suppliers by spend?","Show me all invoices pending 3-way match approval","What's our forecasted EBITDA for Q4?"].map(q=><button key={q} onClick={()=>{setQuery(q);}} className="block w-full rounded-xl border border-border bg-surface/40 px-4 py-3 text-left text-sm text-text-secondary hover:text-text-primary transition-colors">{q}</button>)}</div>}
        </div>
      )}
    </main>
  );
}
