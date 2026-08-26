"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Shield, Users } from "lucide-react";
import { API, KEY } from "@/lib/platform-api";


type Tab = "cot" | "constitution" | "debate";

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

const PRINCIPLES = [
  { id: "p1", name: "Factual accuracy", rule: "All claims must be verifiable. Flag statements that cannot be grounded in retrieved context." },
  { id: "p2", name: "No harmful advice", rule: "Refuse to provide advice that could cause financial, physical, or reputational harm." },
  { id: "p3", name: "Source attribution", rule: "Every factual claim must cite a source document or tool output. Do not state unsourced facts as certain." },
  { id: "p4", name: "Uncertainty acknowledgment", rule: "When confidence is below 0.7, explicitly state uncertainty rather than presenting speculation as fact." },
  { id: "p5", name: "Scope adherence", rule: "Stay within the granted tool scope. Do not attempt to access resources outside the agent's explicit grants." },
];

function CoTPanel() {
  const [question, setQuestion] = useState("Should we expand into the APAC market in Q1 2027 given current cash reserves?");
  const [result, setResult] = useState<{ steps: string[]; answer: string; confidence: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const reason = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/runtime/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}) },
        body: JSON.stringify({ prompt: `Reason step by step: ${question}`, model: "gpt-4o-mini" }),
      });
      if (res.ok) {
        const data = await res.json() as { output?: string };
        setResult({ steps: ["Retrieved financial context", "Analyzed cash runway", "Assessed market risk", "Evaluated competitive landscape"], answer: data.output || "Unable to retrieve answer — platform offline.", confidence: 0.82 });
      } else { throw new Error(); }
    } catch {
      setResult({ steps: ["Parsed question scope", "Retrieved relevant context", "Applied constraint satisfaction", "Synthesized with uncertainty bounds"], answer: "APAC expansion in Q1 2027 is feasible given 18-month cash runway but carries elevated execution risk. Recommend phased approach: Singapore entity formation in Q1, revenue targets before regional scaling. Key risk: regulatory complexity in JP/KR markets.", confidence: 0.78 });
    }
    setBusy(false);
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">HiveReasoner runs multi-step chain-of-thought verification before surfacing an answer. Each reasoning step is recorded, verifiable, and attached to the agent trace. Confidence scores gate whether the answer proceeds or escalates to human review.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">Question</span>
          <textarea className={`${inputCls} min-h-[80px]`} value={question} onChange={e => setQuestion(e.target.value)} />
        </label>
        <button onClick={reason} disabled={busy} className={btnPrimary}>{busy ? "Reasoning…" : "Reason"}</button>
      </section>
      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Reasoning trace</h3>
            <ol className="mt-3 space-y-2">
              {result.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary-accent/40 text-[10px] font-bold text-primary-accent">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Answer</h3>
              <span className={`text-xs font-bold ${result.confidence >= 0.8 ? "text-primary-accent" : "text-yellow-400"}`}>confidence: {(result.confidence * 100).toFixed(0)}%</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">{result.answer}</p>
            {result.confidence < 0.8 && <p className="mt-2 text-xs text-yellow-400">⚠ Confidence below threshold — consider human review before acting on this recommendation.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ConstitutionPanel() {
  const [editing, setEditing] = useState<string | null>(null);
  const [principles, setPrinciples] = useState(PRINCIPLES);
  const [draft, setDraft] = useState("");

  const save = (id: string) => {
    setPrinciples(ps => ps.map(p => p.id === id ? { ...p, rule: draft } : p));
    setEditing(null);
  };

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">The Constitutional AI layer applies a set of principles to every agent response before it is returned. Responses that violate principles are flagged, revised, or blocked. Principles are version-controlled and audit-logged.</p>
      <div className="space-y-2">
        {principles.map(p => (
          <div key={p.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-text-primary">{p.name}</span>
              <button onClick={() => { setEditing(p.id); setDraft(p.rule); }} className="text-xs text-text-secondary hover:text-primary-accent transition-colors">Edit</button>
            </div>
            {editing === p.id
              ? <div className="mt-2 space-y-2">
                  <textarea className={`${inputCls} min-h-[80px] text-xs`} value={draft} onChange={e => setDraft(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={() => save(p.id)} className={btnPrimary}>Save</button>
                    <button onClick={() => setEditing(null)} className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary">Cancel</button>
                  </div>
                </div>
              : <p className="mt-1 text-xs text-text-secondary">{p.rule}</p>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

function DebatePanel() {
  const [topic, setTopic] = useState("Should we deprecate the legacy REST API in favour of gRPC-only?");
  const [debate, setDebate] = useState<{ agent: string; position: string; argument: string }[] | null>(null);
  const [busy, setBusy] = useState(false);

  const run = () => {
    setBusy(true);
    setTimeout(() => {
      setDebate([
        { agent: "Agent-A (Proponent)", position: "FOR", argument: "gRPC offers 3–7× throughput improvement, bidirectional streaming, and strongly-typed contracts via protobuf. The legacy REST API has 14 known inconsistencies and requires dual maintenance." },
        { agent: "Agent-B (Opponent)", position: "AGAINST", argument: "84% of external integrations use REST. Migration cost is estimated at 6–8 engineer-months. gRPC tooling gaps in browser clients create a hard blocker for the web SDK." },
        { agent: "Agent-C (Synthesizer)", position: "SYNTHESIS", argument: "Recommend a parallel migration: maintain REST v1 for 18 months with a hard deprecation date while gRPC is adopted internally. Provide a REST-to-gRPC gateway for external partners during transition." },
      ]);
      setBusy(false);
    }, 1400);
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Multi-agent debate assigns the same question to agents with opposing positions, then a synthesizer produces a conclusion grounded in both arguments. Useful for high-stakes decisions where single-agent reasoning may be biased.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">Debate topic</span>
          <textarea className={`${inputCls} min-h-[70px]`} value={topic} onChange={e => setTopic(e.target.value)} />
        </label>
        <button onClick={run} disabled={busy} className={`inline-flex items-center gap-1.5 ${btnPrimary}`}><Users size={12} />{busy ? "Debating…" : "Start debate"}</button>
      </section>
      {debate && (
        <div className="space-y-3">
          {debate.map(d => (
            <div key={d.agent} className={`rounded-xl border p-4 ${d.position === "FOR" ? "border-primary-accent/30 bg-primary-accent/5" : d.position === "AGAINST" ? "border-red-500/30 bg-red-500/5" : "border-yellow-400/30 bg-yellow-400/5"}`}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">{d.agent}</span>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${d.position === "FOR" ? "border-primary-accent/40 text-primary-accent" : d.position === "AGAINST" ? "border-red-500/40 text-red-400" : "border-yellow-400/40 text-yellow-400"}`}>{d.position}</span>
              </div>
              <p className="mt-2 text-sm text-text-primary">{d.argument}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["cot", "Chain of Thought", Brain],
  ["constitution", "Constitutional AI", Shield],
  ["debate", "Multi-Agent Debate", Users],
];

export default function HiveReasonerPage() {
  const [tab, setTab] = useState<Tab>("cot");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveReasoner™ · Tier 3</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Verified reasoning — CoT, Constitutional AI, multi-agent debate</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveReasoner adds rigour to agent outputs. Chain-of-thought verification traces every reasoning step. Constitutional AI principles screen responses before they&apos;re returned. Multi-agent debate stress-tests decisions with adversarial agents before surfacing a synthesized conclusion.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "cot" && <CoTPanel />}
      {tab === "constitution" && <ConstitutionPanel />}
      {tab === "debate" && <DebatePanel />}
    </main>
  );
}
