"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface CompiledProgram { id: string; goal: string; strategy: string; plan: { steps: { id: number; description: string }[] }; workflowId?: string; runId?: string }

export default function CompilerPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [goal, setGoal] = useState("Research the competitive landscape, draft a positioning brief, then verify it against the source research.");
  const [program, setProgram] = useState<CompiledProgram | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  const compileGoal = useCallback(async () => {
    setBusy(true); setError(null);
    try { setProgram(await api<CompiledProgram>("/v1/compiler/compile", { method: "POST", body: JSON.stringify({ goal, deploy: true }) })); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [goal]);

  return (
    <PillarShell slug="compiler" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <p className="text-sm text-text-secondary">Compiles a sentence directly into a validated, running Cerebro Flow™ workflow — no hand-authored DAG.</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input value={goal} onChange={e => setGoal(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none focus:border-primary-accent" placeholder="Describe a goal to compile…" />
          <button onClick={() => void compileGoal()} disabled={busy || !online || !KEY} className="rounded-lg bg-primary-accent px-6 py-3 text-sm font-semibold text-background disabled:opacity-40">{busy ? "Compiling…" : "Compile & deploy"}</button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {program && (
          <div className="mt-4 rounded-lg border border-border bg-background p-4 text-sm">
            <div className="text-text-primary">Strategy: <span className="text-primary-accent">{program.strategy}</span> · Workflow: <span className="font-mono text-xs">{program.workflowId}</span></div>
            <ol className="mt-2 space-y-1 text-xs text-text-secondary">
              {program.plan.steps.map(s => <li key={s.id}>{s.id}. {s.description}</li>)}
            </ol>
          </div>
        )}
      </section>
    </PillarShell>
  );
}
