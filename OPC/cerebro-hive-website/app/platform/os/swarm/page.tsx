"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface SwarmRoleResult { role: string; description: string; output: string; critique: { ok: boolean; score: number } }
interface SwarmRun { id: string; objective: string; roles: SwarmRoleResult[]; consensus?: { finalAnswer: string; averageScore: number; agreement: number }; status: string; auditTrail: { stage: string; note: string }[] }

export default function SwarmPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [objective, setObjective] = useState("Research the topic, write an implementation, then review it for security issues.");
  const [run, setRun] = useState<SwarmRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  const runSwarm = useCallback(async () => {
    setBusy(true); setError(null);
    try { setRun(await api<SwarmRun>("/v1/swarm/run", { method: "POST", body: JSON.stringify({ objective }) })); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [objective]);

  return (
    <PillarShell slug="swarm" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <p className="text-sm text-text-secondary">A single objective fans out to role-labeled specialists executed by AgentOS™, each independently critiqued, synthesized into one consensus answer, and hard-verified.</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input value={objective} onChange={e => setObjective(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none focus:border-primary-accent" placeholder="Describe an objective for the swarm…" />
          <button onClick={() => void runSwarm()} disabled={busy || !online || !KEY} className="rounded-lg bg-primary-accent px-6 py-3 text-sm font-semibold text-background disabled:opacity-40">{busy ? "Coordinating…" : "Run swarm"}</button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {run && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-wider text-text-secondary">Consensus — {run.status.replace(/_/g, " ")}, avg score {run.consensus?.averageScore}</div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-text-primary">{run.consensus?.finalAnswer}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-wider text-text-secondary">Specialist roles</div>
              <ol className="mt-2 space-y-1 text-xs text-text-secondary">
                {run.roles.map((r, i) => (
                  <li key={i}><span className="text-primary-accent">{r.role}</span>: {r.description} — score {r.critique.score}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>
    </PillarShell>
  );
}
