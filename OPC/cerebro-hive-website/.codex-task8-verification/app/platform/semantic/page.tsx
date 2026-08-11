"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Link2, Code } from "lucide-react";

type Tab = "glossary" | "mapping" | "nl2sql";

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

const TERMS = [
  { term: "Monthly Recurring Revenue", abbr: "MRR", domain: "Finance", definition: "Sum of all recurring subscription revenue normalized to a monthly value. Excludes one-time fees and professional services.", sqlExpr: "SUM(amount) FILTER (WHERE billing_cadence = 'monthly' AND status = 'active')", owner: "finance-team" },
  { term: "Agent Run", abbr: null, domain: "Platform", definition: "A single end-to-end execution of an AI agent from prompt receipt to final response, including all intermediate tool calls and memory retrievals.", sqlExpr: "COUNT(*) FROM agent_performance WHERE status = 'completed'", owner: "platform-team" },
  { term: "Churn Rate", abbr: null, domain: "CRM", definition: "Percentage of customers who cancelled their subscription in a given period. Monthly churn = churned customers / customers at start of month.", sqlExpr: "COUNT(churned) / COUNT(active_at_period_start) * 100", owner: "growth-team" },
  { term: "Ticket Resolution Time", abbr: "TRT", domain: "Customer Success", definition: "Wall-clock time from ticket creation to first resolution. SLA: P1 < 4h, P2 < 24h, P3 < 72h.", sqlExpr: "AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)", owner: "cs-team" },
  { term: "Total Contract Value", abbr: "TCV", domain: "Sales", definition: "Total value of a customer contract over its full term, including all fees and commitments. Not normalized to any time period.", sqlExpr: "SUM(amount * contract_months)", owner: "sales-ops" },
];

const MAPPINGS = [
  { business: "revenue", technical: "finance_facts.amount WHERE account_type = 'revenue'", confidence: 0.97 },
  { business: "active users", technical: "agent_performance.agent_slug (DISTINCT) WHERE date >= CURRENT_DATE - 30", confidence: 0.88 },
  { business: "latency", technical: "agent_performance.latency_ms", confidence: 0.99 },
  { business: "error rate", technical: "agent_performance.status = 'error' / COUNT(*)", confidence: 0.94 },
  { business: "token spend", technical: "agent_performance.tokens_in + agent_performance.tokens_out", confidence: 0.96 },
];

function GlossaryPanel() {
  const [search, setSearch] = useState("");
  const shown = TERMS.filter(t => !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.domain.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">The business glossary is the single authoritative source for every term used across the platform. Each entry maps a business concept to its SQL expression, ensuring agents and analysts speak the same language.</p>
      <input className={inputCls} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search terms…" />
      <div className="space-y-2">
        {shown.map(t => (
          <div key={t.term} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-text-primary">{t.term}</span>
                {t.abbr && <span className="ml-2 text-xs font-bold text-primary-accent">{t.abbr}</span>}
                <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary">{t.domain}</span>
              </div>
              <span className="text-xs text-text-secondary shrink-0">owner: {t.owner}</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">{t.definition}</p>
            <code className="mt-2 block rounded-md bg-surface-elevated/40 px-2 py-1 text-xs text-primary-accent">{t.sqlExpr}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function MappingPanel() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">Semantic mappings resolve natural language business concepts to physical table columns. Agents use these mappings for NL2SQL context injection — ensuring generated SQL matches the actual schema.</p>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-elevated/40">
            <tr>{["Business term", "Technical mapping", "Confidence"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr>
          </thead>
          <tbody>
            {MAPPINGS.map(m => (
              <tr key={m.business} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                <td className="px-3 py-2 font-semibold text-text-primary">{m.business}</td>
                <td className="px-3 py-2 font-mono text-xs text-text-secondary">{m.technical}</td>
                <td className="px-3 py-2"><span className={`font-bold ${m.confidence >= 0.95 ? "text-primary-accent" : "text-yellow-400"}`}>{(m.confidence * 100).toFixed(0)}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NL2SQLPanel() {
  const EXAMPLES: Record<string, string> = {
    "What was our MRR last month?": "SELECT SUM(amount) AS mrr\nFROM finance_facts\nWHERE account_type = 'revenue'\n  AND billing_cadence = 'monthly'\n  AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')\n  AND status = 'active';",
    "Which agents had the highest error rate this week?": "SELECT agent_slug,\n       COUNT(*) FILTER (WHERE status = 'error') * 100.0 / COUNT(*) AS error_rate_pct,\n       COUNT(*) AS total_runs\nFROM agent_performance\nWHERE date >= CURRENT_DATE - INTERVAL '7 days'\nGROUP BY agent_slug\nHAVING COUNT(*) > 10\nORDER BY error_rate_pct DESC\nLIMIT 10;",
    "Show me total token spend by model this month": "SELECT model,\n       SUM(tokens_in + tokens_out) AS total_tokens,\n       SUM((tokens_in + tokens_out) * unit_cost) AS estimated_cost\nFROM agent_performance\nJOIN model_pricing USING (model)\nWHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)\nGROUP BY model\nORDER BY total_tokens DESC;",
  };
  const [question, setQuestion] = useState(Object.keys(EXAMPLES)[0]);
  const [sql, setSql] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const translate = () => {
    setBusy(true);
    setTimeout(() => { setSql(EXAMPLES[question] ?? "-- Translation not available for custom queries in demo mode"); setBusy(false); }, 700);
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">HiveSemantic injects business glossary context into every NL2SQL prompt, improving accuracy from ~60% to ~94% on domain-specific queries. The semantic layer resolves ambiguous terms before the LLM sees the prompt.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {Object.keys(EXAMPLES).map(q => (
            <button key={q} onClick={() => { setQuestion(q); setSql(null); }} className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${question === q ? "border-primary-accent text-primary-accent bg-primary-accent/10" : "border-border text-text-secondary hover:text-text-primary"}`}>{q}</button>
          ))}
        </div>
        <textarea className={`${inputCls} min-h-[60px]`} value={question} onChange={e => { setQuestion(e.target.value); setSql(null); }} />
        <button onClick={translate} disabled={busy} className={`inline-flex items-center gap-1.5 ${btnPrimary}`}><Code size={12} />{busy ? "Translating…" : "Translate to SQL"}</button>
      </section>
      {sql && (
        <div className="rounded-xl border border-border bg-surface-elevated/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">Generated SQL</p>
          <pre className="overflow-auto text-xs text-primary-accent leading-relaxed">{sql}</pre>
        </div>
      )}
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["glossary", "Business Glossary", BookOpen],
  ["mapping", "Semantic Mapping", Link2],
  ["nl2sql", "NL → SQL", Code],
];

export default function HiveSemanticPage() {
  const [tab, setTab] = useState<Tab>("glossary");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveSemantic™ · Tier 3</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Business glossary — semantic mapping, NL2SQL context injection</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveSemantic bridges natural language and data. The business glossary defines every domain term with its SQL expression and ownership. Semantic mappings resolve ambiguous business concepts to physical columns. NL2SQL context injection uses this layer to produce accurate queries without hallucination.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "glossary" && <GlossaryPanel />}
      {tab === "mapping" && <MappingPanel />}
      {tab === "nl2sql" && <NL2SQLPanel />}
    </main>
  );
}
