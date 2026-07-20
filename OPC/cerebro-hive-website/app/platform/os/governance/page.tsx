"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface Inventory { total: number; byKind: Record<string, number>; byRiskTier: Record<string, number>; highRiskWithoutEvidence: { id: string; name: string }[] }
interface EthicsAssessment { overall: number; band: string; scores: Record<string, number>; findings: string[] }

export default function GovernancePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [ethics, setEthics] = useState<EthicsAssessment | null>(null);
  const [ethicsSubject, setEthicsSubject] = useState("gpt-4o-mini");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setInventory(await api<Inventory>("/v1/governance/inventory")); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const runEthics = useCallback(async () => {
    try { setEthics(await api<EthicsAssessment>("/v1/governance/ethics/assess", { method: "POST", body: JSON.stringify({ subjectKind: "model", subjectId: ethicsSubject }) })); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }, [ethicsSubject]);

  return (
    <PillarShell slug="governance" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <h2 className="text-xl font-semibold text-text-primary">Registries &amp; AI Inventory</h2>
        <p className="mt-1 text-sm text-text-secondary">Model, Prompt, Agent, Policy, Risk, and Evidence registries roll up into a single AI Inventory.</p>
        {inventory && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg border border-border bg-background px-3 py-2"><div className="text-xs text-text-secondary">Registered</div><div className="text-lg font-semibold text-text-primary">{inventory.total}</div></div>
            <div className="rounded-lg border border-border bg-background px-3 py-2"><div className="text-xs text-text-secondary">High risk</div><div className="text-lg font-semibold text-text-primary">{inventory.byRiskTier.high ?? 0}</div></div>
            <div className="rounded-lg border border-border bg-background px-3 py-2"><div className="text-xs text-text-secondary">Unevidenced high-risk</div><div className="text-lg font-semibold text-text-primary">{inventory.highRiskWithoutEvidence.length}</div></div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface/40 p-6">
        <h2 className="text-xl font-semibold text-text-primary">Ethics Assessment — eight-pillar scoring</h2>
        <div className="mt-4 flex gap-2">
          <input value={ethicsSubject} onChange={e => setEthicsSubject(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-accent" placeholder="model / agent / workflow id" />
          <button onClick={() => void runEthics()} disabled={!online || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">Assess ethics</button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {ethics && (
          <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
            <div className="text-text-primary">Overall: <span className="font-semibold">{ethics.overall}</span> — <span className="text-primary-accent">{ethics.band.replace(/_/g, " ")}</span></div>
            {ethics.findings.length > 0 && <ul className="mt-1 list-inside list-disc text-xs text-text-secondary">{ethics.findings.map(f => <li key={f}>{f}</li>)}</ul>}
          </div>
        )}
      </section>
    </PillarShell>
  );
}
