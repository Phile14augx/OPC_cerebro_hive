"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ClipboardCheck, KeyRound, ServerCog, Timer } from "lucide-react";
import {
  api, checkOnline, KEY,
  type Approval, type ApprovalStatus,
  type CompliancePosture,
  type ToolGrant,
  type McpServerRegistration, type RiskTier,
  type CapabilityToken,
} from "./lib";

type Tab = "approvals" | "compliance" | "grants" | "mcp" | "tokens";

const RISK_TIERS: RiskTier[] = ["low", "medium", "high", "critical"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary";

function ApprovalsPanel({ online }: { online: boolean | null }) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try {
      const q = statusFilter ? `?status=${statusFilter}` : "";
      setApprovals(await api<Approval[]>(`/v1/governance/approvals${q}`));
    } catch { /* noop */ }
  }, [online, statusFilter]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusyId(id);
    try { await api(`/v1/governance/approvals/${id}/decide`, { method: "POST", body: JSON.stringify({ decision }) }); await refresh(); }
    catch { /* noop */ } finally { setBusyId(null); }
  };

  const statusColor: Record<ApprovalStatus, string> = { pending: "text-yellow-400", approved: "text-primary-accent", rejected: "text-red-400" };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Filter approvals</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Status">
            <select className={inputCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value as ApprovalStatus | "")}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Approval requests ({approvals.length})</h2>
        <div className="mt-3 space-y-3">
          {approvals.map(a => (
            <div key={a.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-text-primary">{a.subjectKind} <span className="text-text-secondary">· {a.subjectId}</span></div>
                <div className={`text-xs font-semibold uppercase ${statusColor[a.status]}`}>{a.status}</div>
              </div>
              <p className="mt-1 text-xs text-text-secondary">Requested by {a.requestedBy} · needs {a.approverRole} approval</p>
              {a.reason && <p className="mt-0.5 text-xs text-text-secondary">Reason: {a.reason}</p>}
              {a.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => decide(a.id, "approved")} disabled={busyId === a.id || !online} className="rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">Approve</button>
                  <button onClick={() => decide(a.id, "rejected")} disabled={busyId === a.id || !online} className="rounded-md border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-400 disabled:opacity-40">Reject</button>
                </div>
              )}
            </div>
          ))}
          {approvals.length === 0 && <p className="text-sm text-text-secondary">No approval requests yet.</p>}
        </div>
      </section>
    </div>
  );
}

function CompliancePanel({ online }: { online: boolean | null }) {
  const [posture, setPosture] = useState<CompliancePosture | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setPosture(await api<CompliancePosture>("/v1/governance/compliance")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">
        Control mappings the platform can attest to, grouped by framework. Each entry cites the concrete
        mechanism (policy engine, audit log, retention sweep, etc.) that satisfies the control — not a
        third-party audit certificate.
      </p>
      {posture && Object.entries(posture).map(([framework, controls]) => (
        <section key={framework} className="rounded-xl border border-border bg-surface/40 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{framework} ({controls.length})</h2>
          <div className="mt-3 space-y-2">
            {controls.map(c => (
              <div key={c.id} className="rounded-lg border border-border bg-surface-elevated/40 px-3 py-2">
                <div className="text-sm font-semibold text-text-primary">{c.id} · {c.name}</div>
                <p className="mt-0.5 text-xs text-text-secondary">{c.evidence}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
      {!posture && <p className="text-sm text-text-secondary">Loading compliance posture…</p>}
    </div>
  );
}

function GrantsPanel({ online }: { online: boolean | null }) {
  const [grants, setGrants] = useState<ToolGrant[]>([]);
  const [form, setForm] = useState({ agentId: "", tool: "", allow: true });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setGrants((await api<{ grants: ToolGrant[] }>("/v1/zerotrust/grants")).grants); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const create = async () => {
    if (!form.agentId.trim() || !form.tool.trim()) return;
    setBusy(true);
    try { await api("/v1/zerotrust/grants", { method: "POST", body: JSON.stringify(form) }); setForm(f => ({ ...f, agentId: "", tool: "" })); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Grant / revoke tool access</h2>
        <p className="mt-1 text-xs text-text-secondary">Deny-by-default: an agent can use a tool only if the most recent matching grant allows it.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Agent ID"><input className={inputCls} value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} placeholder="agent-support-01" /></Field>
          <Field label="Tool"><input className={inputCls} value={form.tool} onChange={e => setForm(f => ({ ...f, tool: e.target.value }))} placeholder="send_email or *" /></Field>
          <Field label="Decision"><select className={inputCls} value={form.allow ? "allow" : "deny"} onChange={e => setForm(f => ({ ...f, allow: e.target.value === "allow" }))}><option value="allow">Allow</option><option value="deny">Deny</option></select></Field>
        </div>
        <button onClick={create} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Saving…" : "Save grant"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Grants ({grants.length})</h2>
        <div className="mt-3 space-y-2">
          {grants.map(g => (
            <div key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/40 p-4">
              <div className="text-sm text-text-primary">{g.agentId} <span className="text-text-secondary">→ {g.tool}</span></div>
              <div className={`text-xs font-semibold uppercase ${g.allow ? "text-primary-accent" : "text-red-400"}`}>{g.allow ? "Allow" : "Deny"}</div>
            </div>
          ))}
          {grants.length === 0 && <p className="text-sm text-text-secondary">No grants configured yet — every tool call is denied by default.</p>}
        </div>
      </section>
    </div>
  );
}

function McpPanel({ online }: { online: boolean | null }) {
  const [servers, setServers] = useState<McpServerRegistration[]>([]);
  const [form, setForm] = useState({ name: "", url: "", riskTier: "medium" as RiskTier, capabilitiesRaw: "" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setServers((await api<{ servers: McpServerRegistration[] }>("/v1/zerotrust/mcp-servers")).servers); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const register = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setBusy(true);
    try {
      const capabilities = form.capabilitiesRaw.split(",").map(s => s.trim()).filter(Boolean);
      await api("/v1/zerotrust/mcp-servers", { method: "POST", body: JSON.stringify({ name: form.name, url: form.url, riskTier: form.riskTier, capabilities }) });
      setForm(f => ({ ...f, name: "", url: "", capabilitiesRaw: "" }));
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const review = async (id: string, decision: "approved" | "denied") => {
    setBusy(true);
    try { await api(`/v1/zerotrust/mcp-servers/${id}/review`, { method: "POST", body: JSON.stringify({ decision }) }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const statusColor: Record<McpServerRegistration["status"], string> = { pending: "text-yellow-400", approved: "text-primary-accent", denied: "text-red-400" };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Register MCP server</h2>
        <p className="mt-1 text-xs text-text-secondary">Low-risk servers auto-approve; medium/high/critical require explicit review below.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="internal-crm-mcp" /></Field>
          <Field label="URL"><input className={inputCls} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://mcp.example.com" /></Field>
          <Field label="Risk tier"><select className={inputCls} value={form.riskTier} onChange={e => setForm(f => ({ ...f, riskTier: e.target.value as RiskTier }))}>{RISK_TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
          <Field label="Capabilities (comma-sep)"><input className={inputCls} value={form.capabilitiesRaw} onChange={e => setForm(f => ({ ...f, capabilitiesRaw: e.target.value }))} placeholder="read_crm, write_notes" /></Field>
        </div>
        <button onClick={register} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Registering…" : "Register server"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">MCP servers ({servers.length})</h2>
        <div className="mt-3 space-y-3">
          {servers.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-text-primary">{s.name} <span className="text-text-secondary">· {s.riskTier} risk</span></div>
                <div className={`text-xs font-semibold uppercase ${statusColor[s.status]}`}>{s.status}</div>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{s.url}</p>
              {s.capabilities.length > 0 && <p className="mt-0.5 text-xs text-text-secondary">Capabilities: {s.capabilities.join(", ")}</p>}
              {s.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => review(s.id, "approved")} disabled={busy || !online} className="rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">Approve</button>
                  <button onClick={() => review(s.id, "denied")} disabled={busy || !online} className="rounded-md border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-400 disabled:opacity-40">Deny</button>
                </div>
              )}
            </div>
          ))}
          {servers.length === 0 && <p className="text-sm text-text-secondary">No MCP servers registered yet.</p>}
        </div>
      </section>
    </div>
  );
}

function TokensPanel({ online }: { online: boolean | null }) {
  const [tokens, setTokens] = useState<CapabilityToken[]>([]);
  const [form, setForm] = useState({ agentId: "", toolsRaw: "", ttlMinutes: 15 });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setTokens((await api<{ tokens: CapabilityToken[] }>("/v1/zerotrust/tokens")).tokens); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

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
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Issue capability token</h2>
        <p className="mt-1 text-xs text-text-secondary">Short-lived, scoped token bounding an agent's blast radius even if its reasoning is compromised.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Agent ID"><input className={inputCls} value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} placeholder="agent-support-01" /></Field>
          <Field label="Tools (comma-sep)"><input className={inputCls} value={form.toolsRaw} onChange={e => setForm(f => ({ ...f, toolsRaw: e.target.value }))} placeholder="send_email, read_crm" /></Field>
          <Field label="TTL (minutes)"><input type="number" min={1} max={1440} className={inputCls} value={form.ttlMinutes} onChange={e => setForm(f => ({ ...f, ttlMinutes: Number(e.target.value) }))} /></Field>
        </div>
        <button onClick={issue} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Issuing…" : "Issue token"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Tokens ({tokens.length})</h2>
        <div className="mt-3 space-y-2">
          {tokens.map(t => (
            <div key={t.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-text-primary">{t.agentId}</div>
                <div className={`text-xs font-semibold uppercase ${t.revoked ? "text-red-400" : isExpired(t) ? "text-text-secondary" : "text-primary-accent"}`}>
                  {t.revoked ? "Revoked" : isExpired(t) ? "Expired" : "Active"}
                </div>
              </div>
              <p className="mt-1 text-xs text-text-secondary">Scoped to: {t.tools.join(", ")}</p>
              <p className="mt-0.5 text-xs text-text-secondary">Expires {new Date(t.expiresAt).toLocaleString()}</p>
            </div>
          ))}
          {tokens.length === 0 && <p className="text-sm text-text-secondary">No capability tokens issued yet.</p>}
        </div>
      </section>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number; className?: string }>][] = [
  ["approvals", "Approvals", ClipboardCheck],
  ["compliance", "Compliance", ShieldCheck],
  ["grants", "Access Grants", KeyRound],
  ["mcp", "MCP Servers", ServerCog],
  ["tokens", "Capability Tokens", Timer],
];

export default function HiveShieldPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("approvals");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveShield™</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Governance, approvals, and Zero Trust agent security in one console</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        HiveShield is the security and governance control plane over CerebroHive's existing Governance and
        Zero Trust domains: approval workflows, compliance control mappings, deny-by-default tool grants,
        MCP server risk review, and short-lived capability tokens — all backed by the same live policy engine
        and audit trail every other product on the platform uses.
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "approvals" && <ApprovalsPanel online={online} />}
      {tab === "compliance" && <CompliancePanel online={online} />}
      {tab === "grants" && <GrantsPanel online={online} />}
      {tab === "mcp" && <McpPanel online={online} />}
      {tab === "tokens" && <TokensPanel online={online} />}
    </main>
  );
}
