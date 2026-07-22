"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Layers } from "lucide-react";
import { api, checkOnline, type ContextBundle, type HubAskResponse } from "./lib";

type Tab = "ask" | "context";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary";

function AskPanel({ online }: { online: boolean | null }) {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const ask = async () => {
    if (!question.trim() || !online) return;
    setBusy(true);
    try {
      const res = await api<HubAskResponse>("/v1/hub/ask", { method: "POST", body: JSON.stringify({ question }) });
      setAnswer(res.answer);
      setHistory(h => [{ q: question, a: res.answer }, ...h].slice(0, 10));
      setQuestion("");
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Ask CerebroCopilot</h2>
        <p className="mt-1 text-xs text-text-secondary">Answers are grounded strictly in your organization&apos;s live platform analytics — executions, knowledge, AI usage, and world-model state.</p>
        <div className="mt-3 flex gap-3">
          <input className={`${inputCls} flex-1`} value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} placeholder="How healthy are our recent agent runs?" />
          <button onClick={ask} disabled={busy || !online} className="rounded-md border border-primary-accent px-4 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40 shrink-0">
            {busy ? "Thinking…" : "Ask"}
          </button>
        </div>
      </section>

      {answer && (
        <section className="rounded-xl border border-border bg-surface/40 p-4">
          <h3 className="text-sm font-semibold text-text-primary">Answer</h3>
          <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">{answer}</p>
        </section>
      )}

      {history.length > 1 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">History</h2>
          <div className="mt-3 space-y-2">
            {history.slice(1).map((h, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface/40 p-4">
                <p className="text-xs font-semibold text-text-primary">{h.q}</p>
                <p className="mt-1 text-xs text-text-secondary">{h.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ContextPanel({ online }: { online: boolean | null }) {
  const [task, setTask] = useState("");
  const [budget, setBudget] = useState(1800);
  const [busy, setBusy] = useState(false);
  const [bundle, setBundle] = useState<ContextBundle | null>(null);

  const assemble = async () => {
    if (!task.trim() || !online) return;
    setBusy(true);
    try { setBundle(await api<ContextBundle>("/v1/context/assemble", { method: "POST", body: JSON.stringify({ task, budgetTokens: budget }) })); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Inspect the assembled context</h2>
        <p className="mt-1 text-xs text-text-secondary">See exactly what CerebroCopilot pulls from conversation memory, workspace memory, knowledge fabric, prior executions, world-model state, and policy before it answers.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-3">
            <Field label="Task"><input className={inputCls} value={task} onChange={e => setTask(e.target.value)} placeholder="Draft a status update for the onboarding rollout" /></Field>
          </div>
          <Field label="Token budget"><input type="number" min={100} max={8000} className={inputCls} value={budget} onChange={e => setBudget(Number(e.target.value))} /></Field>
        </div>
        <button onClick={assemble} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Assembling…" : "Assemble context"}
        </button>
      </section>

      {bundle && (
        <section className="space-y-3">
          <p className="text-xs text-text-secondary">{bundle.totalTokens}/{bundle.budget} tokens used · {bundle.sections.length} sources</p>
          {bundle.sections.map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">{s.title} <span className="text-text-secondary">· {s.source}</span></span>
                <span className="text-text-secondary">{s.tokens} tok · priority {s.priority}</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary whitespace-pre-wrap">{s.content}</p>
            </div>
          ))}
          {bundle.sections.length === 0 && <p className="text-sm text-text-secondary">No context sources matched this task — try ingesting documents in CerebroArchive first.</p>}
        </section>
      )}
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number; className?: string }>][] = [
  ["ask", "Ask", MessageSquare],
  ["context", "Context", Layers],
];

export default function CerebroCopilotPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("ask");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroCopilot™</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">A conversational assistant grounded in your platform&apos;s live state</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        CerebroCopilot is the console over the Context Engine and Intelligence Hub: ask questions answered strictly
        from live analytics, and inspect exactly which context sources — conversation, workspace, knowledge fabric,
        prior executions, world model, policy — get assembled before every answer.
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "ask" && <AskPanel online={online} />}
      {tab === "context" && <ContextPanel online={online} />}
    </main>
  );
}
