"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface AgentStep { thought: string; tool: string; observation: string }
interface AgentResult { finalAnswer: string; steps: AgentStep[]; status: string }

export default function AgentExecutorPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [objective, setObjective] = useState("What is (48000 - 12500) / 12500 * 100?");
  const [result, setResult] = useState<AgentResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  const runAgent = useCallback(async () => {
    setBusy(true); setError(null);
    try { setResult(await api<AgentResult>("/v1/agent/run", { method: "POST", body: JSON.stringify({ objective }) })); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [objective]);

  return (
    <PillarShell slug="agent-executor" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={objective}
            onChange={e => setObjective(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !busy) void runAgent(); }}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary-accent"
            placeholder="Give the agent an objective…"
          />
          <button onClick={() => void runAgent()} disabled={busy || !online || !KEY} className="rounded-lg bg-primary-accent px-6 py-3 font-semibold text-background transition-opacity disabled:opacity-40">
            {busy ? "Running…" : "Run agent"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {result && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-wider text-text-secondary">Final answer — {result.status.replace(/_/g, " ")}</div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-text-primary">{result.finalAnswer}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-wider text-text-secondary">Reasoning trace</div>
              <ol className="mt-2 space-y-2 text-xs text-text-secondary">
                {result.steps.map((s, i) => (
                  <li key={i}><span className="text-primary-accent">{s.tool}</span>: {s.thought} → {s.observation}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>
    </PillarShell>
  );
}
