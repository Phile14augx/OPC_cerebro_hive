"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, KeyRound, Server, Timer } from "lucide-react";
import {
  api, checkOnline, KEY,
  type Agent, type AgentStatus, type ToolGrant, type RiskTier,
  type McpServer, type CapabilityToken,
} from "./lib";



const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";
const btnDanger = "rounded-md border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-400 disabled:opacity-40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  active: "text-primary-accent", inactive: "text-text-secondary", suspended: "text-red-400",
};

// ─── Agents (Principals) ─────────────────────────────────────────────────────
function AgentsPanel({ online }: { online: boolean | null }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", model: "gpt-4o-mini", tools: "", maxSteps: 10 });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setAgents(await api<Agent[]>("/agents")); } catch { /* noop */ }
  }, [online]);

  useEffect(() => { void refresh(); const t = setInterval(() => void refresh(), 6000); return () => clearInterval(t); }, [refresh]);

  const create = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setBusy(true);
    try {
      await api("/agents", {
        method: "POST",
        body: JSON.stringify({
          name: form.name, slug: form.slug, model: form.model,
          tools: form.tools.split(",").map(s => s.trim()).filter(Boolean),
          maxSteps: form.maxSteps,
        }),
      });
      setForm({ name: "", slug: "", model: "gpt-4o-mini", tools: "", maxSteps: 10 });
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const setStatus = async (slug: string, status: AgentStatus) => {
    setBusy(true);
    try { await api(`/agents/${slug}/status?status=${status}`, { method: "PATCH" }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Register agent principal</h2>
        <p className="mt-1 text-xs text-text-secondary">Every agent requires a registered identity before it can receive tool grants or capability tokens.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Display name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Invoice Processor" /></Field>
          <Field label="Slug (unique ID)"><input className={inputCls} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="invoice-processor-v1" /></Field>
          <Field label="Model">
            <select className={inputCls} value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}>
              {["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "claude-3-haiku", "gemini-1-5-pro"].map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Tools (comma-sep)"><input className={inputCls} value={form.tools} onChange={e => setForm(f => ({ ...f, tools: e.target.value }))} placeholder="read_file, call_api" /></Field>
          <Field label="Max steps"><input type="number" className={inputCls} value={form.maxSteps} onChange={e => setForm(f => ({ ...f, maxSteps: Number(e.target.value) }))} min={1} max={100} /></Field>
        </div>
        <button onClick={create} disabled={busy || !online} className={`mt-3 ${btnPrimary}`}>{busy ? "Registering…" : "Register agent"}</button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Agent registry ({agents.length})</h2>
        <div className="mt-3 space-y-2">
          {agents.map(a => (
            <div key={a.slug} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{a.name} <span className="text-text-secondary font-normal text-xs">· {a.slug}</span></div>
                  <p className="mt-0.5 text-xs text-text-secondary">{a.model} · max {a.maxSteps} steps</p>
                  {a.tools.length > 0 && <p className="mt-0.5 text-xs text-text-secondary">Tools: {a.tools.join(", ")}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold uppercase ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  {a.status !== "active" && <button onClick={() => setStatus(a.slug, "active")} disabled={busy} className={btnPrimary}>Activate</button>}
                  {a.status === "active" && <button onClick={() => setStatus(a.slug, "suspended")} disabled={busy} className={btnDanger}>Suspend</button>}
                </div>
              </div>
            </div>
          ))}
          {agents.length === 0 && <p className="text-sm text-text-secondary">No agents registered. Create one above to get started.</p>}
        </div>
      </section>
    </div>
  );
}

// ─── Tool Grants ──────────────────────────────────────────────────────────────
function GrantsPanel({ online }: { online: boolean | null }) {
  const [grants, setGrants] = useState<ToolGrant[]>([]);
  const [form, setForm] = useState({ agentId: "", tool: "", allow: true });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setGrants((await api<{ grants: ToolGrant[] }>("/v1/zerotrust/grants")).grants); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const t = setInterval(() => void refresh(), 6000); return () => clearInterval(t); }, [refresh]);

  const create = async () => {
    if (!form.agentId.trim() || !form.tool.trim()) return;
    setBusy(true);
    try { await api("/v1/zerotrust/grants", { method: "POST", body: JSON.stringify(form) }); setForm(f => ({ ...f, agentId: "", tool: "" })); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Deny-by-default: an agent can invoke a tool only when the most recent matching grant allows it. Grants are evaluated in reverse-chronological order.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Create grant</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Agent ID"><input className={inputCls} value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} placeholder="invoice-processor-v1" /></Field>
          <Field label="Tool (or * for all)"><input className={inputCls} value={form.tool} onChange={e => setForm(f => ({ ...f, tool: e.target.value }))} placeholder="submit_payment" /></Field>
          <Field label="Decision">
            <select className={inputCls} value={form.allow ? "allow" : "deny"} onChange={e => setForm(f => ({ ...f, allow: e.target.value === "allow" }))}>
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
            </select>
          </Field>
        </div>
        <button onClick={create} disabled={busy || !online} className={`mt-3 ${btnPrimary}`}>{busy ? "Saving…" : "Save grant"}</button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Active grants ({grants.length})</h2>
        <div className="mt-3 space-y-2">
          {grants.map(g => (
            <div key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/40 p-4">
              <div className="text-sm text-text-primary">{g.agentId} <span className="text-text-secondary">→ {g.tool}</span></div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold uppercase ${g.allow ? "text-primary-accent" : "text-red-400"}`}>{g.allow ? "Allow" : "Deny"}</span>
                <span className="text-xs text-text-secondary">by {g.grantedBy}</span>
              </div>
            </div>
          ))}
          {grants.length === 0 && <p className="text-sm text-text-secondary">No grants — all tool calls denied by default.</p>}
        </div>
      </section>
    </div>
  );
}

// ─── MCP Servers ──────────────────────────────────────────────────────────────
const RISK_TIERS: RiskTier[] = ["low", "medium", "high", "critical"];

function McpPanel({ online }: { online: boolean | null }) {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [form, setForm] = useState({ name: "", url: "", riskTier: "medium" as RiskTier, capabilitiesRaw: "" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setServers((await api<{ servers: McpServer[] }>("/v1/zerotrust/mcp-servers")).servers); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const t = setInterval(() => void refresh(), 6000); return () => clearInterval(t); }, [refresh]);

  const register = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setBusy(true);
    try {
      await api("/v1/zerotrust/mcp-servers", {
        method: "POST",
        body: JSON.stringify({ name: form.name, url: form.url, riskTier: form.riskTier, capabilities: form.capabilitiesRaw.split(",").map(s => s.trim()).filter(Boolean) }),
      });
      setForm(f => ({ ...f, name: "", url: "", capabilitiesRaw: "" }));
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const review = async (id: string, decision: "approved" | "denied") => {
    setBusy(true);
    try { await api(`/v1/zerotrust/mcp-servers/${id}/review`, { method: "POST", body: JSON.stringify({ decision }) }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const statusColor: Record<McpServer["status"], string> = { pending: "text-yellow-400", approved: "text-primary-accent", denied: "text-red-400" };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">MCP servers extend agent capabilities via the Model Context Protocol. Low-risk servers auto-approve; medium and above require manual review.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Register MCP server</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="internal-crm" /></Field>
          <Field label="URL"><input className={inputCls} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://mcp.example.com" /></Field>
          <Field label="Risk tier">
            <select className={inputCls} value={form.riskTier} onChange={e => setForm(f => ({ ...f, riskTier: e.target.value as RiskTier }))}>
              {RISK_TIERS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Capabilities (comma-sep)"><input className={inputCls} value={form.capabilitiesRaw} onChange={e => setForm(f => ({ ...f, capabilitiesRaw: e.target.value }))} placeholder="read_crm, write_notes" /></Field>
        </div>
        <button onClick={register} disabled={busy || !online} className={`mt-3 ${btnPrimary}`}>{busy ? "Registering…" : "Register"}</button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Registered servers ({servers.length})</h2>
        <div className="mt-3 space-y-3">
          {servers.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{s.name} <span className="text-text-secondary font-normal text-xs">· {s.riskTier} risk</span></div>
                  <p className="mt-0.5 text-xs text-text-secondary">{s.url}</p>
                  {s.capabilities.length > 0 && <p className="mt-0.5 text-xs text-text-secondary">{s.capabilities.join(", ")}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold uppercase ${statusColor[s.status]}`}>{s.status}</span>
                  {s.status === "pending" && <>
                    <button onClick={() => review(s.id, "approved")} disabled={busy} className={btnPrimary}>Approve</button>
                    <button onClick={() => review(s.id, "denied")} disabled={busy} className={btnDanger}>Deny</button>
                  </>}
                </div>
              </div>
            </div>
          ))}
          {servers.length === 0 && <p className="text-sm text-text-secondary">No MCP servers registered yet.</p>}
        </div>
      </section>
    </div>
  );
}

// ─── Capability Tokens ────────────────────────────────────────────────────────
function TokensPanel({ online }: { online: boolean | null }) {
  const [tokens, setTokens] = useState<CapabilityToken[]>([]);
  const [form, setForm] = useState({ agentId: "", toolsRaw: "", ttlMinutes: 15 });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setTokens((await api<{ tokens: CapabilityToken[] }>("/v1/zerotrust/tokens")).tokens); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const t = setInterval(() => void refresh(), 6000); return () => clearInterval(t); }, [refresh]);

  const issue = async () => {
    const tools = form.toolsRaw.split(",").map(s => s.trim()).filter(Boolean);
    if (!form.agentId.trim() || tools.length === 0) return;
    setBusy(true);
    try {
      await api("/v1/zerotrust/tokens", { method: "POST", body: JSON.stringify({ agentId: form.agentId, tools, ttlMinutes: form.ttlMinutes }) });
      setForm(f => ({ ...f, agentId: "", toolsRaw: "" }));
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const isExpired = (t: CapabilityToken) => new Date(t.expiresAt).getTime() < Date.now();

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Ephemeral, scoped JWT tokens bound to a specific agent and tool set. Expired or revoked tokens are rejected at runtime regardless of standing grants. This is the Agent Token Escrow mechanism.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Issue capability token</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Agent ID"><input className={inputCls} value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} placeholder="invoice-processor-v1" /></Field>
          <Field label="Tools (comma-sep)"><input className={inputCls} value={form.toolsRaw} onChange={e => setForm(f => ({ ...f, toolsRaw: e.target.value }))} placeholder="submit_payment, read_gl" /></Field>
          <Field label="TTL (minutes)"><input type="number" min={1} max={1440} className={inputCls} value={form.ttlMinutes} onChange={e => setForm(f => ({ ...f, ttlMinutes: Number(e.target.value) }))} /></Field>
        </div>
        <button onClick={issue} disabled={busy || !online} className={`mt-3 ${btnPrimary}`}>{busy ? "Issuing…" : "Issue token"}</button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Tokens ({tokens.length})</h2>
        <div className="mt-3 space-y-2">
          {tokens.map(t => (
            <div key={t.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{t.agentId}</div>
                  <p className="mt-0.5 text-xs text-text-secondary">Scoped to: {t.tools.join(", ")}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">Expires {new Date(t.expiresAt).toLocaleString()}</p>
                </div>
                <span className={`text-xs font-semibold uppercase ${t.revoked ? "text-red-400" : isExpired(t) ? "text-text-secondary" : "text-primary-accent"}`}>
                  {t.revoked ? "Revoked" : isExpired(t) ? "Expired" : "Active"}
                </span>
              </div>
            </div>
          ))}
          {tokens.length === 0 && <p className="text-sm text-text-secondary">No capability tokens issued yet.</p>}
        </div>
      </section>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const TABS: [Tab, string, React.ComponentType<{ size?: number; className?: string }>][] = [
  ["agents", "Agent Principals", Users],
  ["grants", "Tool Grants", KeyRound],
  ["mcp", "MCP Servers", Server],
  ["tokens", "Capability Tokens", Timer],
];
type Tab = "agents" | "grants" | "mcp" | "tokens";

export default function HiveIdentityPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("agents");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveIdentity™ · Tier 0</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Zero-trust identity for every agent, service, and human principal</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        HiveIdentity is the authentication and authorization root for the Intelligence Mesh. Every agent is a registered principal with an explicit identity. Tool grants are deny-by-default. Capability tokens bound an agent&apos;s blast radius to exactly the tools it needs for a single task. MCP servers require risk-tiered approval before agents can connect.
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable — start AgentOS to connect"}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "agents" && <AgentsPanel online={online} />}
      {tab === "grants" && <GrantsPanel online={online} />}
      {tab === "mcp" && <McpPanel online={online} />}
      {tab === "tokens" && <TokensPanel online={online} />}
    </main>
  );
}
