"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Target, GitBranch, RefreshCw } from "lucide-react";

type Tab = "decompose" | "plan" | "replan";
type StepStatus = "pending" | "in_progress" | "completed" | "blocked";
type Step = { id: string; name: string; description: string; dependsOn: string[]; status: StepStatus; assignedTo: string; estimatedMs: number };

const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";
const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";

const STATUS_COLOR: Record<StepStatus, string> = {
  pending: "border-border text-text-secondary",
  in_progress: "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  completed: "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
  blocked: "border-red-500/40 text-red-400 bg-red-500/10",
};

const SAMPLE_PLAN: Step[] = [
  { id: "s1", name: "Retrieve financial context", description: "Fetch Q3 actuals from CerebroFinance and last 4 quarters from HiveLake.", dependsOn: [], status: "completed", assignedTo: "finance-analyst-v1", estimatedMs: 800 },
  { id: "s2", name: "Identify cost drivers", description: "Analyze expense breakdown and flag YoY increases > 15%.", dependsOn: ["s1"], status: "completed", assignedTo: "finance-analyst-v1", estimatedMs: 1200 },
  { id: "s3", name: "Model revenue scenarios", description: "Run bear / base / bull case projections using Prophet+LSTM.", dependsOn: ["s1"], status: "in_progress", assignedTo: "finance-analyst-v1", estimatedMs: 3400 },
  { id: "s4", name: "Compliance check", description: "Verify projections against GAAP revenue recognition constraints.", dependsOn: ["s3"], status: "pending", assignedTo: "compliance-monitor", estimatedMs: 600 },
  { id: "s5", name: "Draft board narrative", description: "Generate executive summary with key insights and recommended actions.", dependsOn: ["s2", "s4"], status: "pending", assignedTo: "cerebro-copilot", estimatedMs: 2100 },
];

function DecomposePanel() {
  const [goal, setGoal] = useState("Prepare Q3 2026 financial forecast and board narrative by Friday EOD.");
  const [constraints, setConstraints] = useState("Must comply with GAAP. Output should be under 2 pages. Use only data from HiveLake gold zone.");
  const [plan, setPlan] = useState<Step[] | null>(null);
  const [busy, setBusy] = useState(false);

  const decompose = () => {
    setBusy(true);
    setTimeout(() => { setPlan(SAMPLE_PLAN); setBusy(false); }, 1200);
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">HivePlanner decomposes high-level goals into executable agent steps using constraint satisfaction. Specify the goal and constraints — the planner produces a DAG of steps with dependencies, assigned agents, and time estimates.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <div className="space-y-2">
          <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">Goal</span>
            <textarea className={`${inputCls} min-h-[80px]`} value={goal} onChange={e => setGoal(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">Constraints</span>
            <textarea className={`${inputCls} min-h-[60px]`} value={constraints} onChange={e => setConstraints(e.target.value)} />
          </label>
        </div>
        <button onClick={decompose} disabled={busy} className={`inline-flex items-center gap-1.5 ${btnPrimary}`}><Target size={12} />{busy ? "Planning…" : "Decompose goal"}</button>
      </section>
      {plan && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">{plan.length} steps · estimated {(plan.reduce((s, p) => s + p.estimatedMs, 0) / 1000).toFixed(1)}s</h3>
          {plan.map(step => (
            <div key={step.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-text-primary">{step.name}</span>
                  <p className="mt-0.5 text-xs text-text-secondary">{step.description}</p>
                  {step.dependsOn.length > 0 && <p className="mt-1 text-xs text-text-secondary">depends on: {step.dependsOn.join(", ")}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[step.status]}`}>{step.status}</span>
                  <span className="text-xs text-text-secondary">{step.estimatedMs}ms</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-primary-accent font-semibold">→ {step.assignedTo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanPanel() {
  const totalMs = SAMPLE_PLAN.reduce((s, p) => s + p.estimatedMs, 0);
  const critical = ["s1", "s3", "s4", "s5"];
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">The execution plan shows the critical path and parallelism opportunities. Steps without dependencies execute in parallel. The critical path determines the minimum wall-clock time.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Total steps", SAMPLE_PLAN.length], ["Critical path", `${critical.length} steps`], ["Est. wall-clock", `${(totalMs / 1000).toFixed(1)}s`]].map(([k, v]) => (
          <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p>
            <p className="mt-2 text-xl font-bold text-primary-accent">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Execution DAG</h3>
        {SAMPLE_PLAN.map(s => (
          <div key={s.id} className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full shrink-0 ${s.status === "completed" ? "bg-primary-accent" : s.status === "in_progress" ? "bg-yellow-400" : s.status === "blocked" ? "bg-red-400" : "bg-border"}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">{s.name}</span>
                {critical.includes(s.id) && <span className="text-[10px] font-bold text-red-400 uppercase">critical path</span>}
              </div>
              {s.dependsOn.length > 0 && <p className="text-[10px] text-text-secondary">← {s.dependsOn.join(", ")}</p>}
            </div>
            <span className="text-xs text-text-secondary shrink-0">{s.estimatedMs}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReplanPanel() {
  const [trigger, setTrigger] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const triggers = ["Step s3 failed — model timeout", "Constraint changed: output must be 1 page", "New data available: Q3 actuals updated", "Deadline moved to Thursday"];
  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">HivePlanner monitors execution and re-plans automatically when a step fails, a constraint changes, or new information arrives. Adaptive re-planning preserves completed work and finds the shortest new path.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Simulate re-plan trigger</h3>
        <div className="flex flex-wrap gap-2">
          {triggers.map(t => (
            <button key={t} onClick={() => setTrigger(t)} className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${trigger === t ? "border-primary-accent text-primary-accent bg-primary-accent/10" : "border-border text-text-secondary hover:text-text-primary"}`}>{t}</button>
          ))}
        </div>
        <button disabled={!trigger} onClick={() => setResult(`Re-plan complete. Trigger: "${trigger}". Revised plan: skipped step s3, substituted cached model output. New critical path: s1 → s2 → s4 → s5. Estimated wall-clock: 4.5s (was 8.1s).`)} className={`inline-flex items-center gap-1.5 ${btnPrimary}`}><RefreshCw size={12} />Re-plan</button>
      </section>
      {result && (
        <div className="rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-4">
          <p className="text-sm text-text-primary">{result}</p>
        </div>
      )}
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["decompose", "Goal Decomposition", Target],
  ["plan", "Execution Plan", GitBranch],
  ["replan", "Adaptive Re-plan", RefreshCw],
];

export default function HivePlannerPage() {
  const [tab, setTab] = useState<Tab>("decompose");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HivePlanner™ · Tier 3</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Goal decomposition — constraint satisfaction, DAG planning, adaptive re-planning</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HivePlanner turns high-level goals into executable agent plans. It decomposes objectives into dependency-ordered steps, assigns steps to the best-fit agent, estimates timing, and re-plans automatically when conditions change mid-execution.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "decompose" && <DecomposePanel />}
      {tab === "plan" && <PlanPanel />}
      {tab === "replan" && <ReplanPanel />}
    </main>
  );
}
