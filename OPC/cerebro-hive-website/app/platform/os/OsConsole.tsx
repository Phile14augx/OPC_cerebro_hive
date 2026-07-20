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
interface PipelineRun { id: string; pipelineName: string; status: string; stages: { name: string; status: string }[] }
interface ModelVersion { id: string; modelName: string; version: number; stage: string; gateChecks: { name: string; passed: boolean }[] }
interface ScanRun { id: string; kind: string; status: string; findings: { severity: string; rule: string }[] }
interface RedTeamResult { id: string; attacksRun: number; attacksSucceeded: number }
interface Incident { id: string; title: string; severity: string; status: string; suggestedPlaybook?: string }
interface AgentStep { thought: string; tool: string; observation: string }
interface AgentResult { finalAnswer: string; steps: AgentStep[]; status: string }

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

  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [modelVersions, setModelVersions] = useState<ModelVersion[]>([]);
  const [scans, setScans] = useState<ScanRun[]>([]);
  const [redTeam, setRedTeam] = useState<RedTeamResult | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [opsBusy, setOpsBusy] = useState<string | null>(null);
  const [agentObjective, setAgentObjective] = useState("What is (48000 - 12500) / 12500 * 100?");
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [agentBusy, setAgentBusy] = useState(false);

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
      setPipelineRuns((await api<{ runs: PipelineRun[] }>("/v1/devops/pipelines")).runs);
      setModelVersions((await api<{ versions: ModelVersion[] }>("/v1/mlops/models")).versions);
      setScans((await api<{ scans: ScanRun[] }>("/v1/secops/scans")).scans);
      setIncidents((await api<{ incidents: Incident[] }>("/v1/aiops/incidents")).incidents);
    } catch { setOnline(false); }
  }, []);

  const runPipeline = useCallback(async () => {
    setOpsBusy("pipeline");
    try {
      await api("/v1/devops/pipelines/run", { method: "POST", body: JSON.stringify({ pipelineName: "web-api", commitSha: Math.random().toString(16).slice(2, 10), branch: "main" }) });
      setPipelineRuns((await api<{ runs: PipelineRun[] }>("/v1/devops/pipelines")).runs);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setOpsBusy(null); }
  }, []);

  const runScan = useCallback(async () => {
    setOpsBusy("scan");
    try {
      await api("/v1/secops/scans", { method: "POST", body: JSON.stringify({ kind: "sast", target: "web-api" }) });
      setScans((await api<{ scans: ScanRun[] }>("/v1/secops/scans")).scans);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setOpsBusy(null); }
  }, []);

  const runRedTeam = useCallback(async () => {
    setOpsBusy("redteam");
    try { setRedTeam(await api<RedTeamResult>("/v1/secops/redteam", { method: "POST", body: JSON.stringify({ targetKind: "agent", targetId: "runtime-agent-1" }) })); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setOpsBusy(null); }
  }, []);

  const detectAnomalies = useCallback(async () => {
    setOpsBusy("aiops");
    try {
      await api("/v1/aiops/detect", { method: "POST", body: JSON.stringify({ baselines: { error_rate_spike: -1, guard_block_spike: -1 } }) });
      setIncidents((await api<{ incidents: Incident[] }>("/v1/aiops/incidents")).incidents);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setOpsBusy(null); }
  }, []);

  const runAgent = useCallback(async () => {
    setAgentBusy(true); setError(null);
    try { setAgentResult(await api<AgentResult>("/v1/agent/run", { method: "POST", body: JSON.stringify({ objective: agentObjective }) })); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setAgentBusy(false); }
  }, [agentObjective]);

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

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-text-primary">DevOps · MLOps · DevSecOps/MLSecOps · AIOps</h2>
        <p className="mt-1 text-sm text-text-secondary">Live operational domains: CI/CD, model lineage, security scanning, and self-healing incident detection — all running as first-class platform resources.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">DevOps · CI/CD</h3>
              <button onClick={() => void runPipeline()} disabled={opsBusy !== null || !online || !KEY} className="rounded-lg border border-primary-accent px-3 py-1 text-xs font-semibold text-primary-accent disabled:opacity-40">{opsBusy === "pipeline" ? "…" : "Run pipeline"}</button>
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              {pipelineRuns.slice(0, 4).map(r => (
                <li key={r.id} className="rounded-lg border border-border bg-background px-2 py-1.5">
                  <span className={r.status === "succeeded" ? "text-primary-accent" : "text-red-400"}>{r.status}</span> · {r.pipelineName} · {r.stages.length} stages
                </li>
              ))}
              {pipelineRuns.length === 0 && <li className="text-text-secondary">No pipeline runs yet.</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <h3 className="font-semibold text-text-primary">MLOps · Model Lineage</h3>
            <ul className="mt-3 space-y-2 text-xs">
              {modelVersions.slice(0, 4).map(m => (
                <li key={m.id} className="rounded-lg border border-border bg-background px-2 py-1.5">
                  {m.modelName} v{m.version} · <span className="text-primary-accent">{m.stage}</span> · {m.gateChecks.filter(g => g.passed).length}/{m.gateChecks.length} gates
                </li>
              ))}
              {modelVersions.length === 0 && <li className="text-text-secondary">No model versions registered yet.</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-semibold text-text-primary">DevSecOps/MLSecOps</h3>
              <div className="flex gap-1">
                <button onClick={() => void runScan()} disabled={opsBusy !== null || !online || !KEY} className="rounded-lg border border-primary-accent px-2 py-1 text-xs font-semibold text-primary-accent disabled:opacity-40">{opsBusy === "scan" ? "…" : "Scan"}</button>
                <button onClick={() => void runRedTeam()} disabled={opsBusy !== null || !online || !KEY} className="rounded-lg border border-primary-accent px-2 py-1 text-xs font-semibold text-primary-accent disabled:opacity-40">{opsBusy === "redteam" ? "…" : "Red-team"}</button>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              {scans.slice(0, 3).map(s => (
                <li key={s.id} className="rounded-lg border border-border bg-background px-2 py-1.5">
                  {s.kind} · <span className={s.status === "passed" ? "text-primary-accent" : "text-red-400"}>{s.status}</span> · {s.findings.length} findings
                </li>
              ))}
              {redTeam && <li className="rounded-lg border border-border bg-background px-2 py-1.5">Red-team: {redTeam.attacksSucceeded}/{redTeam.attacksRun} attacks succeeded</li>}
              {scans.length === 0 && !redTeam && <li className="text-text-secondary">No scans run yet.</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">AIOps · Incidents</h3>
              <button onClick={() => void detectAnomalies()} disabled={opsBusy !== null || !online || !KEY} className="rounded-lg border border-primary-accent px-3 py-1 text-xs font-semibold text-primary-accent disabled:opacity-40">{opsBusy === "aiops" ? "…" : "Detect"}</button>
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              {incidents.slice(0, 4).map(i => (
                <li key={i.id} className="rounded-lg border border-border bg-background px-2 py-1.5">
                  <span className="text-red-400">{i.severity}</span> · {i.title} · {i.status}
                </li>
              ))}
              {incidents.length === 0 && <li className="text-text-secondary">No open incidents.</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-border bg-surface/40 p-6">
        <h2 className="text-xl font-semibold text-text-primary">Cerebro Agent Executor™ — LangChain/LangGraph-style ReAct loop</h2>
        <p className="mt-1 text-sm text-text-secondary">Binds the runtime tool registry (calculator, catalog, memory, knowledge) into a thought → action → observation loop over Cerebro X™.</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            value={agentObjective}
            onChange={e => setAgentObjective(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !agentBusy) void runAgent(); }}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary-accent"
            placeholder="Give the agent an objective…"
          />
          <button onClick={() => void runAgent()} disabled={agentBusy || !online || !KEY} className="rounded-lg bg-primary-accent px-6 py-3 font-semibold text-background transition-opacity disabled:opacity-40">
            {agentBusy ? "Running…" : "Run agent"}
          </button>
        </div>
        {agentResult && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-wider text-text-secondary">Final answer — {agentResult.status.replace(/_/g, " ")}</div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-text-primary">{agentResult.finalAnswer}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-wider text-text-secondary">Reasoning trace</div>
              <ol className="mt-2 space-y-2 text-xs text-text-secondary">
                {agentResult.steps.map((s, i) => (
                  <li key={i}><span className="text-primary-accent">{s.tool}</span>: {s.thought} → {s.observation}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
