"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Network, ShieldCheck, TrendingUp, Boxes, Gauge, Loader2, AlertTriangle, RotateCcw, Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_AGENTOS_API_URL || "http://localhost:8088";

type Tab = "observatory" | "governance" | "context" | "mesh" | "cortex" | "simulator";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "observatory", label: "Observatory", icon: Activity },
  { id: "governance", label: "Governance", icon: ShieldCheck },
  { id: "context", label: "Context Engine", icon: Boxes },
  { id: "mesh", label: "Agent Mesh", icon: Network },
  { id: "cortex", label: "Cortex", icon: TrendingUp },
  { id: "simulator", label: "Simulator", icon: Gauge },
];

async function api(apiBase: string, apiKey: string | null, path: string, opts: RequestInit = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    ...opts,
    headers: {
      "content-type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(typeof data?.detail === "string" ? data.detail : `request failed (${res.status})`);
  return data;
}

/**
 * The six-tab deep-dive console (Observatory / Governance / Context Engine /
 * Agent Mesh / Cortex / Simulator), sharing the same backend connection as
 * AgentOSBackendConsole above. Mounts its own bootstrap because it can be
 * shown independently, but honors the same adminSecret so a single gate
 * (AgentOSBackendGate.tsx) covers both.
 */
export const AgentOSPlatformConsole = ({ adminSecret }: { adminSecret?: string }) => {
  const [apiBase] = useState(DEFAULT_API_BASE);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [tab, setTab] = useState<Tab>("observatory");
  const [agentSlugs, setAgentSlugs] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const health = await fetch(`${apiBase}/health`, { signal: AbortSignal.timeout(4000) });
        if (!health.ok) return;

        const keyResp = await fetch(`${apiBase}/auth/api-keys`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(adminSecret ? { "X-Admin-Secret": adminSecret } : {}),
          },
          body: JSON.stringify({ owner: "platform-console" }),
        });

        if (keyResp.status === 403) {
          setUnauthorized(true);
          setOnline(false);
          return;
        }
        if (!keyResp.ok) {
          setOnline(false);
          return;
        }

        const key = await keyResp.json();
        setApiKey(key.api_key);
        setOnline(true);
        setUnauthorized(false);
        const agents = await api(apiBase, key.api_key, "/agents");
        setAgentSlugs(agents.map((a: { slug: string }) => a.slug));
      } catch {
        setOnline(false);
      }
    })();
  }, [apiBase, adminSecret]);

  if (unauthorized) {
    return (
      <div className="mt-10 p-5 rounded-xl bg-orange-500/5 border border-orange-500/30 text-xs text-orange-300">
        Admin secret rejected — the deep-dive tabs need the same valid secret as the console above.
      </div>
    );
  }

  if (!online) return null; // AgentOSBackendConsole above already shows the offline instructions

  return (
    <div className="mt-10 flex flex-col gap-6">
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors border",
              tab === t.id ? "bg-primary-accent text-text-primary border-primary-accent" : "bg-surface text-text-secondary border-border hover:text-text-primary"
            )}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === "observatory" && <ObservatoryPanel apiBase={apiBase} apiKey={apiKey} />}
          {tab === "governance" && <GovernancePanel apiBase={apiBase} apiKey={apiKey} />}
          {tab === "context" && <ContextPanel apiBase={apiBase} apiKey={apiKey} agentSlugs={agentSlugs} />}
          {tab === "mesh" && <MeshPanel apiBase={apiBase} apiKey={apiKey} agentSlugs={agentSlugs} />}
          {tab === "cortex" && <CortexPanel apiBase={apiBase} apiKey={apiKey} />}
          {tab === "simulator" && <SimulatorPanel apiBase={apiBase} apiKey={apiKey} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-surface border border-border rounded-2xl p-6", className)}>{children}</div>;
}

function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
      <AlertTriangle size={14} /> {error}
    </div>
  );
}

// ---------- Observatory ----------

interface Summary {
  span_count: number;
  error_count: number;
  error_rate: number;
  latency_p50_ms: number;
  latency_p95_ms: number;
  latency_p99_ms: number;
  total_cost_usd: number;
  total_tokens: number;
  total_runs: number;
  run_status_counts: Record<string, number>;
  per_agent: Record<string, { span_count: number; p50_ms: number; p95_ms: number }>;
}

function ObservatoryPanel({ apiBase, apiKey }: { apiBase: string; apiKey: string | null }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await api(apiBase, apiKey, "/observability/summary"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiBase, apiKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-space font-bold text-text-primary text-sm">Cross-run analytics — real aggregates, computed live from stored spans</h3>
        <button onClick={load} className="p-2 rounded-lg border border-border hover:border-primary-accent/50 text-text-muted">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
        </button>
      </div>
      <ErrorBox error={error} />
      {summary && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="Spans" value={String(summary.span_count)} />
            <Metric label="Error Rate" value={`${(summary.error_rate * 100).toFixed(1)}%`} />
            <Metric label="p50 Latency" value={`${summary.latency_p50_ms}ms`} />
            <Metric label="p95 Latency" value={`${summary.latency_p95_ms}ms`} />
            <Metric label="p99 Latency" value={`${summary.latency_p99_ms}ms`} />
            <Metric label="Total Cost" value={`$${summary.total_cost_usd}`} />
            <Metric label="Total Tokens" value={String(summary.total_tokens)} />
            <Metric label="Runs" value={String(summary.total_runs)} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Run status distribution</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.run_status_counts).map(([status, count]) => (
                <span key={status} className="px-3 py-1.5 rounded-full text-xs bg-surface-elevated border border-border text-text-secondary">
                  {status}: <span className="font-bold text-text-primary">{count}</span>
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Per-agent latency</div>
            <div className="flex flex-col gap-1.5">
              {Object.entries(summary.per_agent).map(([slug, m]) => (
                <div key={slug} className="flex items-center justify-between px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs">
                  <span className="text-text-primary font-bold">{slug}</span>
                  <span className="text-text-muted">{m.span_count} spans · p50 {m.p50_ms}ms · p95 {m.p95_ms}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-surface-elevated border border-border">
      <div className="text-lg font-space font-bold text-text-primary tabular-nums">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-text-muted font-bold">{label}</div>
    </div>
  );
}

// ---------- Governance ----------

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  created_at: string;
}
interface PolicyEntry {
  id: string;
  name: string;
  description: string;
  rule: { if: { field: string; op: string; value: unknown }; then: string };
  enabled: boolean;
}

function GovernancePanel({ apiBase, apiKey }: { apiBase: string; apiKey: string | null }) {
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [policies, setPolicies] = useState<PolicyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", field: "category", op: "==", value: "", then: "require_approval" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setAudit(await api(apiBase, apiKey, "/governance/audit-log?limit=30"));
      setPolicies(await api(apiBase, apiKey, "/governance/policies"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load");
    }
  }, [apiBase, apiKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const createPolicy = async () => {
    if (!form.name || !form.value) return;
    setBusy(true);
    setError(null);
    try {
      await api(apiBase, apiKey, "/governance/policies", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: `Created from the website console`,
          rule: { if: { field: form.field, op: form.op, value: form.value }, then: form.then },
        }),
      });
      setForm({ ...form, name: "", value: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to create policy");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <h3 className="font-space font-bold text-text-primary text-sm mb-4">Create a real policy</h3>
        <div className="flex flex-col gap-3">
          <input placeholder="policy name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary" />
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="field" value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary" />
            <select value={form.op} onChange={(e) => setForm({ ...form, op: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary">
              {["==", "!=", "in", "contains", ">", "<", ">=", "<="].map((op) => <option key={op} value={op}>{op}</option>)}
            </select>
            <input placeholder="value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary" />
          </div>
          <select value={form.then} onChange={(e) => setForm({ ...form, then: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary">
            <option value="require_approval">require_approval</option>
            <option value="block">block</option>
          </select>
          <button onClick={createPolicy} disabled={busy} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-accent text-text-primary font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-40">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Policy
          </button>
          <ErrorBox error={error} />
        </div>
        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Active policies</div>
          <div className="flex flex-col gap-1.5">
            {policies.map((p) => (
              <div key={p.id} className="px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs font-mono text-text-secondary">
                {p.name}: if {p.rule.if.field} {p.rule.if.op} {String(p.rule.if.value)} → {p.rule.then}
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="font-space font-bold text-text-primary text-sm mb-4">Audit log</h3>
        <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto">
          {audit.map((a) => (
            <div key={a.id} className="px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs flex justify-between gap-3">
              <span className="text-text-primary font-bold shrink-0">{a.action}</span>
              <span className="text-text-muted truncate">{a.target}</span>
              <span className="text-text-muted shrink-0">{a.actor}</span>
            </div>
          ))}
          {audit.length === 0 && <div className="text-xs text-text-muted italic">No audit entries yet — create a policy or run an agent.</div>}
        </div>
      </Card>
    </div>
  );
}

// ---------- Context Engine ----------

function ContextPanel({ apiBase, apiKey, agentSlugs }: { apiBase: string; apiKey: string | null; agentSlugs: string[] }) {
  const [slug, setSlug] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ sources: { origin: string; label: string; text: string; score: number }[]; applicable_policies: string[]; assembled_text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!slug && agentSlugs.length) setSlug(agentSlugs[0]);
  }, [agentSlugs, slug]);

  const run = async () => {
    if (!slug || !query) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await api(apiBase, apiKey, `/context/assemble?agent_slug=${encodeURIComponent(slug)}&q=${encodeURIComponent(query)}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <h3 className="font-space font-bold text-text-primary text-sm mb-4">Preview exactly what the runtime hands a reasoning step</h3>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary">
          {agentSlugs.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="query to assemble context for…" className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary" />
        <button onClick={run} disabled={busy} className="px-5 py-2.5 bg-primary-accent text-text-primary font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-40">
          {busy ? <Loader2 size={14} className="animate-spin" /> : "Assemble"}
        </button>
      </div>
      <ErrorBox error={error} />
      {result && (
        <div className="flex flex-col gap-3">
          {result.applicable_policies.length > 0 && (
            <div className="text-xs text-yellow-400">Applicable policies: {result.applicable_policies.join(", ")}</div>
          )}
          {result.sources.map((s, i) => (
            <div key={i} className="p-3 bg-surface-elevated border border-border rounded-lg text-xs">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-text-primary">{s.label}</span>
                <span className="text-text-muted">{s.origin} · score {s.score}</span>
              </div>
              <div className="text-text-secondary">{s.text}</div>
            </div>
          ))}
          {result.sources.length === 0 && <div className="text-xs text-text-muted italic">No matching memory or knowledge for this query yet.</div>}
        </div>
      )}
    </Card>
  );
}

// ---------- Agent Mesh ----------

function MeshPanel({ apiBase, apiKey, agentSlugs }: { apiBase: string; apiKey: string | null; agentSlugs: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (slug: string) => setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const run = async () => {
    if (selected.length < 2 || !goal) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const wf = await api(apiBase, apiKey, "/workflows", {
        method: "POST",
        body: JSON.stringify({
          name: "website-consensus-vote",
          definition: {
            start: "n1",
            nodes: {
              n1: { type: "agent_vote", agent_slugs: selected, goal, next: "n2" },
              n2: { type: "finish", status: "completed" },
            },
          },
          context: {},
        }),
      });
      setResult(wf.context);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <h3 className="font-space font-bold text-text-primary text-sm mb-4">Fan a goal out to multiple agents and reach real consensus</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {agentSlugs.map((s) => (
          <button
            key={s}
            onClick={() => toggle(s)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-bold border", selected.includes(s) ? "bg-primary-accent/10 border-primary-accent/50 text-primary-accent" : "bg-surface-elevated border-border text-text-secondary")}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="shared goal for every selected agent…" className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary" />
        <button onClick={run} disabled={busy || selected.length < 2} className="px-5 py-2.5 bg-primary-accent text-text-primary font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-40">
          {busy ? <Loader2 size={14} className="animate-spin" /> : "Run Vote"}
        </button>
      </div>
      <ErrorBox error={error} />
      {result && (
        <div className="flex flex-col gap-2 text-xs">
          <div className="p-3 bg-primary-accent/5 border border-primary-accent/20 rounded-lg">
            <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">Winning answer — {String(result.n1_winner_agent)} (consensus {String(result.n1_consensus_score)})</div>
            <div className="text-text-primary">{String(result.n1_result)}</div>
          </div>
          <pre className="p-3 bg-surface-elevated border border-border rounded-lg overflow-x-auto text-text-muted">{JSON.stringify(result.n1_candidates, null, 2)}</pre>
        </div>
      )}
    </Card>
  );
}

// ---------- Cortex ----------

function CortexPanel({ apiBase, apiKey }: { apiBase: string; apiKey: string | null }) {
  const [series, setSeries] = useState("100, 120, 138, 161, 180");
  const [forecast, setForecast] = useState<Record<string, unknown> | null>(null);
  const [itemsJson, setItemsJson] = useState('[{"name":"A","cost":6,"value":30},{"name":"B","cost":3,"value":14},{"name":"C","cost":4,"value":16},{"name":"D","cost":2,"value":9}]');
  const [budget, setBudget] = useState("10");
  const [optimize, setOptimize] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const runForecast = async () => {
    setBusy(true);
    setError(null);
    try {
      const values = series.split(",").map((v) => parseFloat(v.trim())).filter((v) => !Number.isNaN(v));
      setForecast(await api(apiBase, apiKey, "/cortex/forecast", { method: "POST", body: JSON.stringify({ values, periods_ahead: 3 }) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  const runOptimize = async () => {
    setBusy(true);
    setError(null);
    try {
      const items = JSON.parse(itemsJson);
      setOptimize(await api(apiBase, apiKey, "/cortex/optimize", { method: "POST", body: JSON.stringify({ budget: parseInt(budget, 10), items }) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed — check the items JSON");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <h3 className="font-space font-bold text-text-primary text-sm mb-4">Real least-squares forecast</h3>
        <input value={series} onChange={(e) => setSeries(e.target.value)} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary mb-3" />
        <button onClick={runForecast} disabled={busy} className="px-5 py-2.5 bg-primary-accent text-text-primary font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-40">
          {busy ? <Loader2 size={14} className="animate-spin" /> : "Forecast"}
        </button>
        {forecast && (
          <div className="mt-4 text-xs text-text-secondary flex flex-col gap-1">
            <div>slope <span className="text-text-primary font-bold">{String(forecast.slope)}</span>, r² <span className="text-text-primary font-bold">{String(forecast.r_squared)}</span></div>
            <div>next periods: <span className="text-text-primary font-bold">{JSON.stringify(forecast.forecast)}</span></div>
          </div>
        )}
      </Card>
      <Card>
        <h3 className="font-space font-bold text-text-primary text-sm mb-4">Exact 0/1 knapsack optimizer</h3>
        <textarea value={itemsJson} onChange={(e) => setItemsJson(e.target.value)} rows={3} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-xs font-mono text-text-primary mb-3" />
        <div className="flex gap-3 mb-3">
          <input value={budget} onChange={(e) => setBudget(e.target.value)} className="w-28 px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary" />
          <button onClick={runOptimize} disabled={busy} className="px-5 py-2.5 bg-primary-accent text-text-primary font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-40">
            {busy ? <Loader2 size={14} className="animate-spin" /> : "Optimize"}
          </button>
        </div>
        {optimize && (
          <div className="text-xs text-text-secondary">
            Selected <span className="text-text-primary font-bold">{JSON.stringify(optimize.selected)}</span> — value {String(optimize.total_value)}, cost {String(optimize.total_cost)}
          </div>
        )}
      </Card>
      <div className="lg:col-span-2"><ErrorBox error={error} /></div>
    </div>
  );
}

// ---------- Simulator ----------

function SimulatorPanel({ apiBase, apiKey }: { apiBase: string; apiKey: string | null }) {
  const [params, setParams] = useState({ arrival_rate_per_hour: "30", num_agents: "3", mean_service_minutes: "8", duration_hours: "8", trials: "150", seed: "42" });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      setResult(
        await api(apiBase, apiKey, "/simulator/run", {
          method: "POST",
          body: JSON.stringify({
            arrival_rate_per_hour: parseFloat(params.arrival_rate_per_hour),
            num_agents: parseInt(params.num_agents, 10),
            mean_service_minutes: parseFloat(params.mean_service_minutes),
            duration_hours: parseFloat(params.duration_hours),
            trials: parseInt(params.trials, 10),
            seed: parseInt(params.seed, 10),
          }),
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <h3 className="font-space font-bold text-text-primary text-sm mb-4">Monte Carlo digital twin — &ldquo;what if we staffed N agents?&rdquo;</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {Object.entries(params).map(([key, value]) => (
          <div key={key}>
            <label className="text-[9px] uppercase tracking-widest text-text-muted font-bold block mb-1">{key.replace(/_/g, " ")}</label>
            <input value={value} onChange={(e) => setParams({ ...params, [key]: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary" />
          </div>
        ))}
      </div>
      <button onClick={run} disabled={busy} className="px-5 py-2.5 bg-primary-accent text-text-primary font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-40">
        {busy ? <Loader2 size={14} className="animate-spin" /> : "Run Simulation"}
      </button>
      <ErrorBox error={error} />
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Metric label="Mean Wait" value={`${result.mean_wait_minutes}m`} />
          <Metric label="p95 Wait" value={`${result.p95_wait_minutes}m`} />
          <Metric label="Backlog @ End" value={String(result.mean_backlog_at_end)} />
          <Metric label="Utilization" value={`${(Number(result.utilization) * 100).toFixed(1)}%`} />
        </div>
      )}
    </Card>
  );
}
