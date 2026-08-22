"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";
import { TrackedButton } from "@/components/cerebro/TrackedButton";

interface PipelineRun { id: string; pipelineName: string; status: string; stages: { name: string; status: string }[] }

export default function DevOpsPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setPipelineRuns((await api<{ runs: PipelineRun[] }>("/v1/devops/pipelines")).runs); } catch { /* noop */ }
  }, []);

// eslint-disable-next-line renders -- ARCH-LINT: Deferred
  useEffect(() => { void refresh(); }, [refresh]);

  const runPipeline = useCallback(async () => {
    setBusy(true);
    try {
      await api("/v1/devops/pipelines/run", { method: "POST", body: JSON.stringify({ pipelineName: "web-api", commitSha: Math.random().toString(16).slice(2, 10), branch: "main" }) });
      setPipelineRuns((await api<{ runs: PipelineRun[] }>("/v1/devops/pipelines")).runs);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, []);

  return (
    <PillarShell slug="devops" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">CI/CD pipeline runs</h2>
          <TrackedButton eventCategory="platform-os-devops" eventLabel="Run Pipeline" onClick={() => void runPipeline()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">{busy ? "…" : "Run pipeline"}</TrackedButton>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <ul className="mt-4 space-y-2 text-sm">
          {pipelineRuns.map(r => (
            <li key={r.id} className="rounded-lg border border-border bg-background px-3 py-2">
              <span className={r.status === "succeeded" ? "text-primary-accent" : "text-red-400"}>{r.status}</span> · {r.pipelineName} · {r.stages.length} stages
            </li>
          ))}
          {pipelineRuns.length === 0 && <li className="text-text-secondary">No pipeline runs yet.</li>}
        </ul>
      </section>
    </PillarShell>
  );
}
