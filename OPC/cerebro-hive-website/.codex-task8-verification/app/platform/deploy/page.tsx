"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "pipelines" | "gitops" | "gates";
const PIPELINES = [
  { name: "cerebro-platform-api", branch: "main", status: "passed", duration: "4m 12s", commit: "feat: add streaming agent responses", sha: "a3f91c2", ago: "8min ago" },
  { name: "hive-agents-worker", branch: "main", status: "running", duration: "2m 05s", commit: "fix: token budget overflow guard", sha: "c7d04e1", ago: "2min ago" },
  { name: "cerebro-finance-svc", branch: "release/2.4", status: "passed", duration: "3m 44s", commit: "chore: bump deps", sha: "9b2e3f4", ago: "1h ago" },
  { name: "hive-knowledge-ingest", branch: "feature/iceberg-v2", status: "failed", duration: "1m 31s", commit: "feat: iceberg snapshot pruning", sha: "e1a82b5", ago: "3h ago" },
];
const STATUS_COLOR: Record<string, string> = {
  passed: "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
  running: "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  failed: "border-red-500/40 text-red-400 bg-red-500/10",
};
export default function HiveDeployPage() {
  const [tab, setTab] = useState<Tab>("pipelines");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveDeploy™ · Tier 5</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">CI/CD &amp; GitOps — pipeline orchestration, quality gates, progressive rollouts</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveDeploy integrates CI/CD pipelines with the full platform. Agent-generated code flows through automated test suites, security scans, and quality gates before progressive rollout. ArgoCD manages GitOps sync; Tekton runs the pipelines.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["pipelines","gitops","gates"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="pipelines" && (
        <div className="mt-6 space-y-2">
          {PIPELINES.map(p=>(
            <div key={p.name} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary font-mono">{p.name}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">branch: <span className="text-primary-accent">{p.branch}</span> · <span className="font-mono">{p.sha}</span> · {p.commit}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-secondary">{p.duration}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[p.status]}`}>{p.status}</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{p.ago}</p>
            </div>
          ))}
        </div>
      )}
      {tab==="gitops" && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-text-secondary">ArgoCD syncs every merge to main. Drift detection fires if live state diverges from the repository manifest within 60 seconds. Rollbacks are a single git revert.</p>
          {[
            ["cerebro-platform-api","Production","Synced","2min ago"],
            ["hive-agents-worker","Production","Synced","2min ago"],
            ["cerebro-finance-svc","Staging","Synced","1h ago"],
            ["hive-knowledge-ingest","Production","OutOfSync","3h ago"],
          ].map(([app,env,state,ago])=>(
            <div key={String(app)} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-4">
              <div><p className="font-semibold font-mono text-text-primary">{app}</p><p className="mt-0.5 text-xs text-text-secondary">{env} · {ago}</p></div>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${state==="Synced"?"border-primary-accent/40 text-primary-accent bg-primary-accent/10":"border-red-500/40 text-red-400 bg-red-500/10"}`}>{state}</span>
            </div>
          ))}
        </div>
      )}
      {tab==="gates" && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-text-secondary">Every deployment must pass all gates before reaching production. Gate failures block the pipeline and notify the on-call engineer.</p>
          {[
            ["Unit tests","≥ 95% pass rate","enforced"],
            ["SAST scan","0 high-severity findings","enforced"],
            ["Container image scan","0 critical CVEs","enforced"],
            ["Integration tests","≥ 90% pass rate","enforced"],
            ["Performance regression","P95 latency ≤ 110% of baseline","enforced"],
            ["Agent output quality","Eval score ≥ 0.80","enforced"],
            ["Manual approval (production)","Team lead sign-off","required"],
          ].map(([gate,threshold,status])=>(
            <div key={String(gate)} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary-accent shrink-0" />
              <div className="flex-1 min-w-0"><p className="font-semibold text-text-primary">{gate}</p><p className="mt-0.5 text-xs text-text-secondary">{threshold}</p></div>
              <span className="rounded-full border border-primary-accent/40 bg-primary-accent/10 px-2 py-0.5 text-xs font-semibold text-primary-accent shrink-0">{status}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
