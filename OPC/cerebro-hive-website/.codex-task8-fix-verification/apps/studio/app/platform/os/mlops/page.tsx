"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface ModelVersion { id: string; modelName: string; version: number; stage: string; gateChecks: { name: string; passed: boolean }[] }

export default function MLOpsPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [modelVersions, setModelVersions] = useState<ModelVersion[]>([]);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setModelVersions((await api<{ versions: ModelVersion[] }>("/v1/mlops/models")).versions); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <PillarShell slug="mlops" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <h2 className="text-xl font-semibold text-text-primary">Model lineage &amp; deployment gates</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {modelVersions.map(m => (
            <li key={m.id} className="rounded-lg border border-border bg-background px-3 py-2">
              {m.modelName} v{m.version} · <span className="text-primary-accent">{m.stage}</span> · {m.gateChecks.filter(g => g.passed).length}/{m.gateChecks.length} gates passed
            </li>
          ))}
          {modelVersions.length === 0 && <li className="text-text-secondary">No model versions registered yet.</li>}
        </ul>
      </section>
    </PillarShell>
  );
}
