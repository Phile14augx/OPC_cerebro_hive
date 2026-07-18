"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Server,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_AGENTOS_API_URL || "http://localhost:8088";

interface AgentSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tools: string[];
  lifecycle_state: string;
  status: string;
}

interface PlanStep {
  id: string;
  description: string;
  kind: string;
  tool: string | null;
}

interface RunRecord {
  id: string;
  agent_id: string;
  goal: string;
  status: string;
  plan: PlanStep[];
  steps_completed: string[];
  result: string | null;
  error: string | null;
}

interface TraceSpan {
  id: string;
  name: string;
  status: string;
  duration_ms: number;
}

interface Approval {
  id: string;
  run_id: string;
  policy_name: string;
  reason: string;
  status: string;
}

type ConnectionState = "checking" | "offline" | "unauthorized" | "online";

/**
 * The other half of "Run the Real Kernel — Live": this panel talks over HTTP
 * to the actual AgentOS backend service (agentos/ in this repo — a real
 * FastAPI app with an agent registry, governance policies, workflows, and a
 * persistent runtime), rather than the deterministic in-browser kernel in
 * AgentOSLiveRuntime.tsx. The two are independent, real implementations.
 *
 * In production this points at NEXT_PUBLIC_AGENTOS_API_URL and requires an
 * admin secret (entered by the caller, see AgentOSBackendGate.tsx) to mint an
 * API key — locally, with no AGENTOS_ADMIN_SECRET configured on the backend,
 * any adminSecret (including none) works.
 */
export const AgentOSBackendConsole = ({ adminSecret }: { adminSecret?: string }) => {
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);
  const [connection, setConnection] = useState<ConnectionState>("checking");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [run, setRun] = useState<RunRecord | null>(null);
  const [traces, setTraces] = useState<TraceSpan[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useCallback(
    (): Record<string, string> => (apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    [apiKey]
  );

  const bootstrap = useCallback(async () => {
    setConnection("checking");
    setError(null);
    try {
      const health = await fetch(`${apiBase}/health`, { signal: AbortSignal.timeout(4000) });
      if (!health.ok) throw new Error("unhealthy");

      const keyResp = await fetch(`${apiBase}/auth/api-keys`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(adminSecret ? { "X-Admin-Secret": adminSecret } : {}),
        },
        body: JSON.stringify({ owner: "cerebrohive-website" }),
      });

      if (keyResp.status === 403) {
        setConnection("unauthorized");
        return;
      }
      if (!keyResp.ok) throw new Error(`key issuance failed (${keyResp.status})`);

      const keyData = await keyResp.json();
      setApiKey(keyData.api_key);
      setConnection("online");

      const agentsResp = await fetch(`${apiBase}/agents`, {
        headers: { Authorization: `Bearer ${keyData.api_key}` },
      });
      const agentsData: AgentSummary[] = await agentsResp.json();
      setAgents(agentsData);
      if (agentsData.length > 0) setSelectedSlug((prev) => prev ?? agentsData[0].slug);
    } catch {
      setConnection("offline");
    }
  }, [apiBase, adminSecret]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    bootstrap();
  }, [bootstrap]);

  const fetchTraces = useCallback(
    async (runId: string) => {
      const resp = await fetch(`${apiBase}/observability/traces?run_id=${runId}`, { headers: authHeaders() });
      setTraces(await resp.json());
    },
    [apiBase, authHeaders]
  );

  const fetchApprovals = useCallback(
    async (runId: string) => {
      const resp = await fetch(`${apiBase}/governance/approvals?status=pending`, { headers: authHeaders() });
      const all: Approval[] = await resp.json();
      setApprovals(all.filter((a) => a.run_id === runId));
    },
    [apiBase, authHeaders]
  );

  const execute = useCallback(async () => {
    if (!selectedSlug || !goal.trim()) return;
    setBusy(true);
    setError(null);
    setRun(null);
    setTraces([]);
    setApprovals([]);
    try {
      const resp = await fetch(`${apiBase}/runtime/execute`, {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeaders() },
        body: JSON.stringify({ agent_slug: selectedSlug, goal }),
      });
      if (!resp.ok) throw new Error(`runtime returned ${resp.status}`);
      const runData: RunRecord = await resp.json();
      setRun(runData);
      await fetchTraces(runData.id);
      if (runData.status === "pending_approval") await fetchApprovals(runData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "execution failed — is the AgentOS server running?");
    } finally {
      setBusy(false);
    }
  }, [apiBase, authHeaders, fetchApprovals, fetchTraces, goal, selectedSlug]);

  const decide = useCallback(
    async (approvalId: string, decision: "approve" | "reject") => {
      if (!run) return;
      setBusy(true);
      try {
        await fetch(`${apiBase}/governance/approvals/${approvalId}/decide`, {
          method: "POST",
          headers: { "content-type": "application/json", ...authHeaders() },
          body: JSON.stringify({ decision, decided_by: "phil (via website)" }),
        });
        const resp = await fetch(`${apiBase}/runtime/runs/${run.id}`, { headers: authHeaders() });
        const updated: RunRecord = await resp.json();
        setRun(updated);
        await fetchTraces(updated.id);
        setApprovals([]);
      } finally {
        setBusy(false);
      }
    },
    [apiBase, authHeaders, fetchTraces, run]
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border shadow-sm">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              connection === "online"
                ? "bg-primary-accent animate-pulse"
                : connection === "checking"
                ? "bg-yellow-500"
                : connection === "unauthorized"
                ? "bg-orange-500"
                : "bg-red-500"
            )}
          />
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
            {connection === "online"
              ? "Connected to the Python AgentOS backend"
              : connection === "checking"
              ? "Connecting…"
              : connection === "unauthorized"
              ? "Admin secret rejected"
              : "Backend offline"}
          </span>
        </div>
        <p className="text-xs text-text-muted max-w-md">
          Real registry, governance policies, and traced execution over HTTP — a separate service from the in-browser kernel above.
        </p>
      </div>

      {connection === "unauthorized" && (
        <div className="bg-surface border border-orange-500/30 rounded-2xl p-6 flex gap-4">
          <Lock className="text-orange-400 shrink-0" size={22} />
          <div className="flex-1">
            <div className="font-bold text-text-primary mb-1">Admin secret rejected by {apiBase}</div>
            <p className="text-sm text-text-secondary">
              This backend has <code className="bg-background border border-border rounded px-1">AGENTOS_ADMIN_SECRET</code> configured
              and the value provided didn&apos;t match. Re-enter the correct secret to continue.
            </p>
          </div>
        </div>
      )}

      {connection === "offline" && (
        <div className="bg-surface border border-red-500/30 rounded-2xl p-6 flex gap-4">
          <AlertTriangle className="text-red-400 shrink-0" size={22} />
          <div className="flex-1">
            <div className="font-bold text-text-primary mb-1">Can&apos;t reach {apiBase}</div>
            <p className="text-sm text-text-secondary mb-4">
              Start it from the repo&apos;s <code className="bg-background border border-border rounded px-1">agentos/</code> folder:{" "}
              <code className="bg-background border border-border rounded px-1">pip install -r requirements.txt --break-system-packages</code>,{" "}
              <code className="bg-background border border-border rounded px-1">python scripts/seed.py</code>, then{" "}
              <code className="bg-background border border-border rounded px-1">uvicorn app.main:app --port 8088</code>. In production,
              this is whatever URL <code className="bg-background border border-border rounded px-1">NEXT_PUBLIC_AGENTOS_API_URL</code> points to.
            </p>
            <div className="flex gap-2">
              <input
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary"
              />
              <button onClick={bootstrap} className="px-4 py-2 bg-primary-accent text-text-primary font-bold text-xs uppercase tracking-widest rounded-lg shrink-0">
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {connection === "online" && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">1. Choose a registered agent</div>
            <div className="flex flex-col gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.slug}
                  onClick={() => setSelectedSlug(agent.slug)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all",
                    selectedSlug === agent.slug ? "bg-primary-accent/10 border-primary-accent/50" : "bg-surface border-border hover:border-border-strong"
                  )}
                >
                  <div className="font-space font-bold text-text-primary text-sm">{agent.name}</div>
                  <div className="text-xs text-text-muted mt-1">{agent.category}{agent.tools.length > 0 ? ` · ${agent.tools.join(", ")}` : ""}</div>
                </button>
              ))}
              {agents.length === 0 && (
                <p className="text-xs text-text-muted">
                  No agents registered yet — run <code className="bg-surface border border-border rounded px-1">python scripts/seed.py</code> in the agentos/ folder.
                </p>
              )}
            </div>

            <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mt-4">2. Give it a goal</div>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Reconcile last month's vendor invoices (finance-agent will trip governance)"
              rows={4}
              className="p-4 bg-surface border border-border rounded-xl text-sm text-text-primary resize-none focus:outline-none focus:border-primary-accent"
            />

            <button
              onClick={execute}
              disabled={busy || !selectedSlug || !goal.trim()}
              className="group px-6 py-3.5 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition-all hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Execute on the backend
            </button>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {run ? (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0.4, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col gap-8"
                >
                  <div className="flex items-center justify-between pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Terminal size={20} className="text-primary-accent" />
                      <span className="font-space font-bold text-text-primary">Run {run.id.slice(0, 8)}</span>
                    </div>
                    <StatusBadge status={run.status} />
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-3">Plan</div>
                    <div className="flex flex-col gap-2">
                      {run.plan.map((step) => {
                        const done = run.steps_completed.includes(step.id);
                        return (
                          <div key={step.id} className="flex items-center gap-3 text-sm">
                            {done ? <CheckCircle2 size={14} className="text-primary-accent shrink-0" /> : <ChevronRight size={14} className="text-text-muted shrink-0" />}
                            <span className={done ? "text-text-primary" : "text-text-muted"}>{step.description}</span>
                            {step.tool && <span className="text-[10px] px-2 py-0.5 bg-background border border-border rounded text-text-muted">{step.tool}</span>}
                          </div>
                        );
                      })}
                      {run.plan.length === 0 && <p className="text-xs text-text-muted">Plan not generated yet — governance is evaluating this run.</p>}
                    </div>
                  </div>

                  {approvals.length > 0 && (
                    <div className="p-5 bg-yellow-500/5 border border-yellow-500/30 rounded-xl flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-yellow-400 text-xs uppercase tracking-widest font-bold">
                        <ShieldAlert size={14} /> Governance requires human approval
                      </div>
                      {approvals.map((a) => (
                        <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-sm text-text-secondary">
                            <span className="font-bold text-text-primary">{a.policy_name}</span> — {a.reason}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => decide(a.id, "approve")} disabled={busy} className="px-4 py-2 bg-primary-accent text-text-primary text-xs font-bold uppercase tracking-widest rounded-lg">
                              Approve
                            </button>
                            <button onClick={() => decide(a.id, "reject")} disabled={busy} className="px-4 py-2 bg-background border border-border text-text-secondary text-xs font-bold uppercase tracking-widest rounded-lg">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {run.result && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-3">Result</div>
                      <div className="p-4 bg-background border border-border rounded-xl text-sm text-text-primary font-mono leading-relaxed">{run.result}</div>
                    </div>
                  )}

                  {run.error && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/30 rounded-xl text-sm text-red-300">
                      <XCircle size={16} /> {run.error}
                    </div>
                  )}

                  {traces.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-3">Trace</div>
                      <div className="flex flex-col gap-1.5 font-mono text-xs">
                        {traces.map((t) => (
                          <div key={t.id} className="flex items-center justify-between px-3 py-2 bg-background border border-border rounded-lg">
                            <span className="text-text-primary">{t.name}</span>
                            <span className="text-text-muted">{t.duration_ms.toFixed(2)}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full min-h-[300px] bg-surface border border-border rounded-2xl flex flex-col items-center justify-center text-text-muted text-sm gap-3">
                  <Server size={24} className="opacity-50" />
                  Select an agent, give it a goal, and execute — this calls the real backend over HTTP.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-primary-accent/10 text-primary-accent border-primary-accent/30",
    pending_approval: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    failed: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border", styles[status] || "bg-background text-text-muted border-border")}>
      {status.replace("_", " ")}
    </span>
  );
}
