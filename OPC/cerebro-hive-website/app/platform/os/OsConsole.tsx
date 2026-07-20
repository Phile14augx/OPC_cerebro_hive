"use client";

import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

interface Cockpit {
  analytics?: { executions?: { total: number; completed: number; failed: number }; knowledge?: { documents: number }; ai?: { calls: number; costUsd: number } };
  mesh?: { total: number; online: number };
  governance?: { pendingApprovals: number };
}
interface ExecutionResult {
  id: string; status: string;
  plan?: { strategy: string; steps: { id: number; description: string; tool?: string }[] };
  result?: { output: string; verification: { ok: boolean; score: number; issues: string[] } };
  steps?: { seq: number; name: string; tool?: string; output?: string; status: string }[];
  error?: string;
}
interface Capability { id: string; name: string; tagline: string; deliverables: string[]; poweredBy: string[] }
interface Inventory { total: number; byKind: Record<string, number>; byRiskTier: Record<string, number>; highRiskWithoutEvidence: { id: string; name: string }[] }
interface EthicsAssessment { overall: number; band: string; scores: Record<string, number>; findings: string[] }
interface Chain { id: string; name: string; layer: string; nativeCurrency: string }
interface DefiProtocol { id: string; name: string; category: string; chains: string[] }
interface AccountLookup { chain: { id: string; name: string }; address: string; balanceFormatted: string; nonce: number; gasPriceGwei: number; source: string }
interface ComplianceResult { riskScore: number; band: string; signals: string[] }

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Bearer ${KEY}`, ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default function OsConsole() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [cockpit, setCockpit] = useState<Cockpit | null>(null);
  const [catalog, setCatalog] = useState<Capability[]>([]);
  const [goal, setGoal] = useState("Compute the ROI: (48000 - 12500) / 12500 * 100");
  const [running, setRunning] = useState(false);
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [ethics, setEthics] = useState<EthicsAssessment | null>(null);
  const [ethicsSubject, setEthicsSubject] = useState("gpt-4o-mini");
  const [chains, setChains] = useState<Chain[]>([]);
  const [defi, setDefi] = useState<DefiProtocol[]>([]);
  const [chainId, setChainId] = useState("ethereum");
  const [address, setAddress] = useState("0x0000000000000000000000000000000000dEaD");
  const [account, setAccount] = useState<AccountLookup | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [web3Busy, setWeb3Busy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const health = await fetch(`${API}/health`).then(r => r.ok);
      setOnline(health);
      if (!health || !KEY) return;
      setCockpit(await api<Cockpit>("/v1/sphere/cockpit"));
      setCatalog(await api<Capability[]>("/v1/consulting/catalog"));
      setInventory(await api<Inventory>("/v1/governance/inventory"));
      setChains((await api<{ chains: Chain[] }>("/v1/web3/chains")).chains);
      setDefi((await api<{ protocols: DefiProtocol[] }>("/v1/web3/defi")).protocols);
    } catch { setOnline(false); }
  }, []);

  const runEthics = useCallback(async () => {
    try { setEthics(await api<EthicsAssessment>("/v1/governance/ethics/assess", { method: "POST", body: JSON.stringify({ subjectKind: "model", subjectId: ethicsSubject }) })); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }, [ethicsSubject]);

  const lookupAccount = useCallback(async () => {
    setWeb3Busy(true);
    try {
      setAccount(await api<AccountLookup>(`/v1/web3/accounts/${chainId}/${address}`));
      setCompliance(await api<ComplianceResult>(`/v1/web3/compliance/${chainId}/${address}`));
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setWeb3Busy(false); }
  }, [chainId, address]);

  useEffect(() => { void refresh(); }, [refresh]);

  const run = useCallback(async () => {
    setRunning(true); setError(null); setExecution(null);
    try {
      const res = await api<ExecutionResult>("/v1/runtime/executions", { method: "POST", body: JSON.stringify({ goal, sync: true }) });
      setExecution(res);
      void refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setRunning(false); }
  }, [goal, refresh]);

  const stat = (label: string, value: string | number) => (
    <div className="rounded-lg border border-border bg-surface/60 px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-text-primary">{value}</div>
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">Enterprise AI OS — Production Instance</p>
      <h1 className="mt-3 text-4xl font-bold text-text-primary md:text-5xl">Operate the OS. Live.</h1>
      <p className="mt-4 max-w-2xl text-text-secondary">
        This console talks to the CerebroHive Enterprise AI OS running on this site&apos;s own infrastructure:
        Cerebro X™ gateway, AgentOS™ runtime with Guard™ in the execution path, Knowledge Fabric™,
        Agent Mesh™, and the ten Core Consulting Capabilities. Every number below is computed by the real platform.
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">
          {online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}
          {online && !KEY ? " — demo key not configured at build time" : ""}
        </span>
      </div>

      {cockpit && (
        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {stat("Executions", cockpit.analytics?.executions?.total ?? 0)}
          {stat("Completed", cockpit.analytics?.executions?.completed ?? 0)}
          {stat("Documents", cockpit.analytics?.knowledge?.documents ?? 0)}
          {stat("AI calls", cockpit.analytics?.ai?.calls ?? 0)}
          {stat("Mesh agents", `${cockpit.mesh?.online ?? 0}/${cockpit.mesh?.total ?? 0}`)}
        </section>
      )}

      <section className="mt-10 rounded-xl border border-border bg-surface/40 p-6">
        <h2 className="text-xl font-semibold text-text-primary">Run a goal through AgentOS™</h2>
        <p className="mt-1 text-sm text-text-secondary">Guard inspects the input, the Reasoning Engine selects a strategy, the Planner decomposes, tools execute, the Critic verifies.</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !running) void run(); }}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary-accent"
            placeholder="Give the runtime a task…"
          />
          <button
            onClick={() => void run()}
            disabled={running || !online || !KEY}
            className="rounded-lg bg-primary-accent px-6 py-3 font-semibold text-background transition-opacity disabled:opacity-40"
          >
            {running ? "Running…" : "Run"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">Blocked/failed: {error}</p>}
        {execution?.result && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-wider text-text-secondary">Output — verification score {execution.result.verification.score}</div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-text-primary">{execution.result.output}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-wider text-text-secondary">Plan — {execution.plan?.strategy}</div>
              <ol className="mt-2 space-y-1 text-sm text-text-secondary">
                {execution.plan?.steps.map(s => (
                  <li key={s.id}>{s.id}. {s.description}{s.tool ? <span className="text-primary-accent"> · {s.tool}</span> : null}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-text-primary">Core Consulting Capabilities — served by this OS</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {catalog.map(c => (
            <div key={c.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="font-semibold text-text-primary">{c.name}</div>
              <p className="mt-1 text-sm text-text-secondary">{c.tagline}</p>
              <p className="mt-2 text-xs text-text-secondary">Powered by: <span className="text-primary-accent">{c.poweredBy.join(", ")}</span></p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/40 p-6">
          <h2 className="text-xl font-semibold text-text-primary">AI Governance™ — Registries &amp; Ethics</h2>
          <p className="mt-1 text-sm text-text-secondary">Model, Prompt, Agent, Policy, Risk, and Evidence registries roll up into a single AI Inventory; every subject can be scored across the eight AI-ethics pillars.</p>
          {inventory && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg border border-border bg-background px-3 py-2"><div className="text-xs text-text-secondary">Registered</div><div className="text-lg font-semibold text-text-primary">{inventory.total}</div></div>
              <div className="rounded-lg border border-border bg-background px-3 py-2"><div className="text-xs text-text-secondary">High risk</div><div className="text-lg font-semibold text-text-primary">{inventory.byRiskTier.high ?? 0}</div></div>
              <div className="rounded-lg border border-border bg-background px-3 py-2"><div className="text-xs text-text-secondary">Unevidenced high-risk</div><div className="text-lg font-semibold text-text-primary">{inventory.highRiskWithoutEvidence.length}</div></div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <input value={ethicsSubject} onChange={e => setEthicsSubject(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-accent" placeholder="model / agent / workflow id" />
            <button onClick={() => void runEthics()} disabled={!online || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">Assess ethics</button>
          </div>
          {ethics && (
            <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
              <div className="text-text-primary">Overall: <span className="font-semibold">{ethics.overall}</span> — <span className="text-primary-accent">{ethics.band.replace(/_/g, " ")}</span></div>
              {ethics.findings.length > 0 && <ul className="mt-1 list-inside list-disc text-xs text-text-secondary">{ethics.findings.map(f => <li key={f}>{f}</li>)}</ul>}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface/40 p-6">
          <h2 className="text-xl font-semibold text-text-primary">Cerebro Chain™ — Blockchain &amp; Web3</h2>
          <p className="mt-1 text-sm text-text-secondary">Chain registry, DeFi catalog, and read-only account/compliance lookups over public RPCs (deterministic fallback offline).</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chains.map(c => (
              <button key={c.id} onClick={() => setChainId(c.id)} className={`rounded-full border px-3 py-1 text-xs ${chainId === c.id ? "border-primary-accent text-primary-accent" : "border-border text-text-secondary"}`}>{c.name}</button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={address} onChange={e => setAddress(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-accent" placeholder="address" />
            <button onClick={() => void lookupAccount()} disabled={web3Busy || !online || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">{web3Busy ? "…" : "Lookup"}</button>
          </div>
          {account && (
            <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm text-text-primary">
              Balance: <span className="font-semibold">{account.balanceFormatted} {account.chain.name === "Solana" ? "SOL" : "native"}</span> · nonce {account.nonce} · gas {account.gasPriceGwei} gwei
              <span className="ml-2 text-xs text-text-secondary">({account.source})</span>
              {compliance && <div className="mt-1 text-xs text-text-secondary">Compliance risk: <span className="text-primary-accent">{compliance.band}</span> ({compliance.riskScore})</div>}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {defi.map(p => <span key={p.id} className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">{p.name} · {p.category}</span>)}
          </div>
        </div>
      </section>
    </main>
  );
}
