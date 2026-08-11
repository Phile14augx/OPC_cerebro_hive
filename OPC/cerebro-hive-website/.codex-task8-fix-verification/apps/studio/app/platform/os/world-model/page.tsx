"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface WorldGraph { edges: { id: string; from: string; to: string; relationship: string }[] }

export default function WorldModelPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [graph, setGraph] = useState<WorldGraph | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setGraph(await api<WorldGraph>("/v1/world/graph")); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <PillarShell slug="world-model" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <h2 className="text-xl font-semibold text-text-primary">Relationship graph</h2>
        <p className="mt-1 text-sm text-text-secondary">Every object — employees, departments, risks, assets, policies — projected into one living graph.</p>
        <div className="mt-4 text-3xl font-semibold text-text-primary">{graph?.edges.length ?? 0}</div>
        <div className="text-xs text-text-secondary">relationship edges tracked</div>
        <ul className="mt-4 space-y-1.5 text-xs">
          {graph?.edges.slice(0, 20).map(e => (
            <li key={e.id} className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-[11px] text-text-secondary">{e.from} —{e.relationship}→ {e.to}</li>
          ))}
          {(!graph || graph.edges.length === 0) && <li className="text-text-secondary">No edges tracked yet — run a Digital Twin scenario or register enterprise entities to populate the graph.</li>}
        </ul>
      </section>
    </PillarShell>
  );
}
