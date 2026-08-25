"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Scale, BookOpen, ClipboardCheck, ScrollText } from "lucide-react";
import {
  api, checkOnline, KEY,
  type Policy, type PolicyEffect, type AuditEntry, type Approval, type ApprovalStatus, type CompliancePosture,
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

const EFFECTS: PolicyEffect[] = ["allow", "deny", "require_approval"];
const EFFECT_COLORS: Record<PolicyEffect, string> = {
  allow: "text-primary-accent", deny: "text-red-400", require_approval: "text-yellow-400",
};

// ─── Policies ─────────────────────────────────────────────────────────────────
function PoliciesPanel({ online }: { online: boolean | null }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [form, setForm] = useState({ name: "", description: "", effect: "deny" as PolicyEffect, conditionsRaw: "{}", priority: 50 });
  const [busy, setBusy] = useState(false);
  const [condError, setCondError] = useState("");

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setPolicies(await api<Policy[]>("/governance/policies")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const t = setInterval(() => void refresh(), 6000); return () => clearInterval(t); }, [refresh]);

  const create = async () => {
    if (!form.name.trim()) return;
    let conditions: Record<string, unknown> = {};
    try { conditions = JSON.parse(form.conditionsRaw); setCondError(""); }
    catch { setCondError("Invalid JSON"); return; }
    setBusy(true);
    try {
      await api("/governance/policies", {
        method: "POST",
        body: JSON.stringify({ name: form.name, description: form.description, effect: form.effect, conditions, priority: form.priority }),
      });
      setForm({ name: "", description: "", effect: "deny", conditionsRaw: "{}", priority: 50 });
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Define policy</h2>
        <p className="mt-1 text-xs text-text-secondary">Policies are evaluated before every agent action. Higher priority (lower number) wins on conflict.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="block-pii-exfiltration" /></Field>
          <Field label="Effect">
            <select className={inputCls} value={form.effect} onChange={e => setForm(f => ({ ...f, effect: e.target.value as PolicyEffect }))}>
              {EFFECTS.map(e => <option key={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="Priority (1=highest)"><input type="number" min={1} max={1000} className={inputCls} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} /></Field>
          <Field label="Description"><input className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Blocks actions that may exfiltrate PII" /></Field>
        </div>
        <div className="mt-3">
          <Field label={`Conditions (JSON)${condError ? ` — ${condError}` : ""}`}>
            <textarea className={`${inputCls} min-h-[80px] font-mono text-xs`} value={form.conditionsRaw} onChange={e => setForm(f => ({ ...f, conditionsRaw: e.target.value }))} placeholder='{"tool": "send_email", "dataClassification": "PII"}' />
          </Field>
        </div>
        <button onClick={create} disabled={busy || !online} className={`mt-3 ${btnPrimary}`}>{busy ? "Creating…" : "Create policy"}</button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Policy registry ({policies.length})</h2>
        <div className="mt-3 space-y-2">
          {policies.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{p.name} <span className="text-text-secondary font-normal text-xs">· priority {p.priority}</span></div>
                  {p.description && <p className="mt-0.5 text-xs text-text-secondary">{p.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold uppercase ${EFFECT_COLORS[p.effect]}`}>{p.effect.replace("_", " ")}</span>
                  <span className={`text-xs ${p.enabled ? "text-primary-accent" : "text-text-secondary"}`}>{p.enabled ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
              {Object.keys(p.conditions).length > 0 && (
                <pre className="mt-2 rounded bg-surface-elevated/60 p-2 text-xs text-text-secondary overflow-x-auto">{JSON.stringify(p.conditions, null, 2)}</pre>
              )}
            </div>
          ))}
          {policies.length === 0 && <p className="text-sm text-text-secondary">No policies defined. The platform defaults to allow when no policy matches.</p>}
        </div>
      </section>
    </div>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
function AuditPanel({ online }: { online: boolean | null }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState({ actorId: "", resourceKind: "", outcome: "" });

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try {
      const params = new URLSearchParams();
      if (filter.actorId) params.set("actor_id", filter.actorId);
      if (filter.resourceKind) params.set("resource_kind", filter.resourceKind);
      if (filter.outcome) params.set("outcome", filter.outcome);
      params.set("limit", "50");
      setEntries(await api<AuditEntry[]>(`/governance/audit-log?${params}`));
    } catch { /* noop */ }
  }, [online, filter]);
  useEffect(() => { void refresh(); const t = setInterval(() => void refresh(), 5000); return () => clearInterval(t); }, [refresh]);

  const outcomeColor: Record<string, string> = { allowed: "text-primary-accent", denied: "text-red-400", pending: "text-yellow-400" };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Filter audit log</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Actor ID"><input className={inputCls} value={filter.actorId} onChange={e => setFilter(f => ({ ...f, actorId: e.target.value }))} placeholder="invoice-processor-v1" /></Field>
          <Field label="Resource kind"><input className={inputCls} value={filter.resourceKind} onChange={e => setFilter(f => ({ ...f, resourceKind: e.target.value }))} placeholder="tool_call" /></Field>
          <Field label="Outcome">
            <select className={inputCls} value={filter.outcome} onChange={e => setFilter(f => ({ ...f, outcome: e.target.value }))}>
              <option value="">All</option>
              <option>allowed</option>
              <option>denied</option>
              <option>pending</option>
            </select>
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Audit log — last 50 entries</h2>
        <p className="mt-1 text-xs text-text-secondary">HMAC-chained immutable log. Every write appends; no record can be modified or deleted.</p>
        <div className="mt-3 space-y-2">
          {entries.map(e => (
            <div key={e.id} className="rounded-xl border border-border bg-surface/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-text-primary font-semibold">{e.actorId} <span className="font-normal text-text-secondary">→ {e.action}</span></span>
                <span className={`text-xs font-semibold uppercase ${outcomeColor[e.outcome] ?? "text-text-secondary"}`}>{e.outcome}</span>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">{e.resourceKind} · {e.resourceId} · {new Date(e.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {entries.length === 0 && <p className="text-sm text-text-secondary">No audit entries yet.</p>}
        </div>
      </section>
    </div>
  );
}

// ─── Approvals ────────────────────────────────────────────────────────────────
function ApprovalsPanel({ online }: { online: boolean | null }) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try {
      const q = statusFilter ? `?status=${statusFilter}` : "";
      setApprovals(await api<Approval[]>(`/governance/approvals${q}`));
    } catch { /* noop */ }
  }, [online, statusFilter]);
  useEffect(() => { void refresh(); const t = setInterval(() => void refresh(), 5000); return () => clearInterval(t); }, [refresh]);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusy(true);
    try { await api(`/governance/approvals/${id}/decide`, { method: "POST", body: JSON.stringify({ decision }) }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const statusColor: Record<ApprovalStatus, string> = { pending: "text-yellow-400", approved: "text-primary-accent", rejected: "text-red-400" };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Approval requests are generated when an agent action triggers a <code className="text-primary-accent">require_approval</code> policy. Agents block until a decision is recorded.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <Field label="Status filter">
          <select className={inputCls} style={{ maxWidth: 200 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value as ApprovalStatus | "")}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </Field>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Approval requests ({approvals.length})</h2>
        <div className="mt-3 space-y-3">
          {approvals.map(a => (
            <div key={a.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{a.subjectKind} <span className="text-text-secondary font-normal">· {a.subjectId}</span></div>
                  <p className="mt-0.5 text-xs text-text-secondary">Requested by {a.requestedBy} · needs <span className="font-semibold">{a.approverRole}</span> approval</p>
                  {a.reason && <p className="mt-0.5 text-xs text-text-secondary">Reason: {a.reason}</p>}
                </div>
                <span className={`text-xs font-semibold uppercase ${statusColor[a.status]}`}>{a.status}</span>
              </div>
              {a.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => decide(a.id, "approved")} disabled={busy || !online} className={btnPrimary}>Approve</button>
                  <button onClick={() => decide(a.id, "rejected")} disabled={busy || !online} className={btnDanger}>Reject</button>
                </div>
              )}
              {a.decidedBy && <p className="mt-2 text-xs text-text-secondary">Decided by {a.decidedBy} at {new Date(a.decidedAt!).toLocaleString()}</p>}
            </div>
          ))}
          {approvals.length === 0 && <p className="text-sm text-text-secondary">No approval requests.</p>}
        </div>
      </section>
    </div>
  );
}

// ─── Compliance ────────────────────────────────────────────────────────────────
function CompliancePanel({ online }: { online: boolean | null }) {
  const [posture, setPosture] = useState<CompliancePosture | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setPosture(await api<CompliancePosture>("/governance/compliance")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const t = setInterval(() => void refresh(), 30000); return () => clearInterval(t); }, [refresh]);

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">
        Real-time compliance posture — control mappings the platform can attest to today, grouped by regulatory framework.
        Each entry cites the concrete technical mechanism (policy engine, audit chain, retention sweep) rather than aspirational claims.
      </p>
      {posture && Object.entries(posture).map(([framework, controls]) => (
        <section key={framework} className="rounded-xl border border-border bg-surface/40 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{framework}</h2>
            <span className="text-xs text-primary-accent font-semibold">{controls.length} controls</span>
          </div>
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
      {!posture && <p className="text-sm text-text-secondary">{online ? "Loading compliance posture…" : "Waiting for platform…"}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Tab = "policies" | "audit" | "approvals" | "compliance";
const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["policies", "Policies", Scale],
  ["audit", "Audit Log", ScrollText],
  ["approvals", "Approvals", ClipboardCheck],
  ["compliance", "Compliance", BookOpen],
];

export default function HiveGovernPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("policies");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveGovern™ · Tier 0</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Policy-as-code governance with HMAC-chained immutable audit</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        HiveGovern is the governance control plane: declarative policies evaluated before every agent action, a tamper-proof append-only audit trail, human-in-the-loop approval workflows, and real-time compliance posture across all registered regulatory frameworks.
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "policies" && <PoliciesPanel online={online} />}
      {tab === "audit" && <AuditPanel online={online} />}
      {tab === "approvals" && <ApprovalsPanel online={online} />}
      {tab === "compliance" && <CompliancePanel online={online} />}
    </main>
  );
}
