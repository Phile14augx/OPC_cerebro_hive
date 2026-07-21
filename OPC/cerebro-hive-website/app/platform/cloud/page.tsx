"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cloud, Database, Cpu, Network, Lock, Activity, Code2 } from "lucide-react";
import {
  api, checkOnline, KEY,
  type CloudAccount, type CloudProvider, type CloudEnvironment,
  type StorageBucket, type StorageTier,
  type ComputeInstance, type ComputeKind, type ComputeSizeTier,
  type NetworkTopology,
  type IdentityRole,
  type Monitor,
  type ApiEndpoint, type ApiAuthType, type HttpMethod,
} from "./lib";

type Tab = "cloud" | "storage" | "compute" | "network" | "identity" | "monitor" | "api";

const PROVIDERS: CloudProvider[] = ["aws", "azure", "gcp", "on-prem"];
const ENVIRONMENTS: CloudEnvironment[] = ["production", "staging", "development"];
const TIERS: StorageTier[] = ["hot", "warm", "cold", "archive"];
const COMPUTE_KINDS: ComputeKind[] = ["vm", "container", "serverless"];
const COMPUTE_SIZES: ComputeSizeTier[] = ["small", "medium", "large", "xlarge"];
const AUTH_TYPES: ApiAuthType[] = ["api-key", "oauth2", "mtls"];
const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-primary-accent" : "bg-yellow-400"}`} />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary";

function CloudPanel({ online }: { online: boolean | null }) {
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [form, setForm] = useState({ accountName: "", provider: "aws" as CloudProvider, region: "us-east-1", environment: "production" as CloudEnvironment });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setAccounts((await api<{ accounts: CloudAccount[] }>("/v1/hivecloud/accounts")).accounts); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const provision = async () => {
    if (!form.accountName.trim()) return;
    setBusy(true);
    try { await api("/v1/hivecloud/accounts", { method: "POST", body: JSON.stringify(form) }); setForm(f => ({ ...f, accountName: "" })); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Provision cloud account</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Account name"><input className={inputCls} value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} placeholder="acme-prod" /></Field>
          <Field label="Provider"><select className={inputCls} value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value as CloudProvider }))}>{PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></Field>
          <Field label="Region"><input className={inputCls} value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} /></Field>
          <Field label="Environment"><select className={inputCls} value={form.environment} onChange={e => setForm(f => ({ ...f, environment: e.target.value as CloudEnvironment }))}>{ENVIRONMENTS.map(e => <option key={e} value={e}>{e}</option>)}</select></Field>
        </div>
        <button onClick={provision} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Provisioning…" : "Provision account"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Accounts ({accounts.length})</h2>
        <div className="mt-3 space-y-3">
          {accounts.map(a => (
            <div key={a.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-text-primary">{a.accountName} <span className="text-text-secondary">· {a.provider} · {a.region}</span></div>
                <div className="flex items-center gap-2 text-xs"><StatusDot ok={a.status === "active"} /> {a.status} · {a.environment}</div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3 text-xs">
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Monthly cost</div><div className="font-semibold text-text-primary">${a.monthlyCostUsd.toLocaleString()}</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Compliance score</div><div className="font-semibold text-text-primary">{a.complianceScore}/100</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Landing zone</div><div className="font-semibold text-text-primary">{a.landingZoneComponents.length} components</div></div>
              </div>
              <ul className="mt-2 space-y-0.5 text-xs text-text-secondary">{a.landingZoneComponents.map((c, i) => <li key={i}>• {c}</li>)}</ul>
            </div>
          ))}
          {accounts.length === 0 && <p className="text-sm text-text-secondary">No cloud accounts yet.</p>}
        </div>
      </section>
    </div>
  );
}

function StoragePanel({ online }: { online: boolean | null }) {
  const [buckets, setBuckets] = useState<StorageBucket[]>([]);
  const [form, setForm] = useState({ name: "", provider: "aws" as CloudProvider, tier: "hot" as StorageTier, sizeGb: 100 });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setBuckets((await api<{ buckets: StorageBucket[] }>("/v1/hivestorage/buckets")).buckets); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const provision = async () => {
    if (!form.name.trim() || form.sizeGb <= 0) return;
    setBusy(true);
    try { await api("/v1/hivestorage/buckets", { method: "POST", body: JSON.stringify(form) }); setForm(f => ({ ...f, name: "" })); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Provision storage bucket</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="acme-backups" /></Field>
          <Field label="Provider"><select className={inputCls} value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value as CloudProvider }))}>{PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></Field>
          <Field label="Tier"><select className={inputCls} value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value as StorageTier }))}>{TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
          <Field label="Size (GB)"><input type="number" min={1} className={inputCls} value={form.sizeGb} onChange={e => setForm(f => ({ ...f, sizeGb: Number(e.target.value) }))} /></Field>
        </div>
        <button onClick={provision} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Provisioning…" : "Provision bucket"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Buckets ({buckets.length})</h2>
        <div className="mt-3 space-y-3">
          {buckets.map(b => (
            <div key={b.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="text-sm font-semibold text-text-primary">{b.name} <span className="text-text-secondary">· {b.provider} · {b.tier}</span></div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4 text-xs">
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Size</div><div className="font-semibold text-text-primary">{b.sizeGb.toLocaleString()} GB</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Monthly cost</div><div className="font-semibold text-text-primary">${b.monthlyCostUsd.toFixed(2)}</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Replication</div><div className="font-semibold text-text-primary">{b.replicationFactor}x</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Encrypted</div><div className="font-semibold text-text-primary">{b.encrypted ? "Yes" : "No"}</div></div>
              </div>
              <p className="mt-2 text-xs text-text-secondary">{b.lifecyclePolicy}</p>
            </div>
          ))}
          {buckets.length === 0 && <p className="text-sm text-text-secondary">No storage buckets yet.</p>}
        </div>
      </section>
    </div>
  );
}

function ComputePanel({ online }: { online: boolean | null }) {
  const [instances, setInstances] = useState<ComputeInstance[]>([]);
  const [form, setForm] = useState({ name: "", kind: "vm" as ComputeKind, sizeTier: "medium" as ComputeSizeTier, region: "us-east-1", autoscaling: false });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setInstances((await api<{ instances: ComputeInstance[] }>("/v1/hivecompute/instances")).instances); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const provision = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    try { await api("/v1/hivecompute/instances", { method: "POST", body: JSON.stringify(form) }); setForm(f => ({ ...f, name: "" })); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Provision compute instance</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="api-worker" /></Field>
          <Field label="Kind"><select className={inputCls} value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value as ComputeKind }))}>{COMPUTE_KINDS.map(k => <option key={k} value={k}>{k}</option>)}</select></Field>
          <Field label="Size"><select className={inputCls} value={form.sizeTier} onChange={e => setForm(f => ({ ...f, sizeTier: e.target.value as ComputeSizeTier }))}>{COMPUTE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="Region"><input className={inputCls} value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} /></Field>
          <Field label="Autoscaling"><select className={inputCls} value={form.autoscaling ? "yes" : "no"} onChange={e => setForm(f => ({ ...f, autoscaling: e.target.value === "yes" }))}><option value="no">No</option><option value="yes">Yes</option></select></Field>
        </div>
        <button onClick={provision} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Provisioning…" : "Provision instance"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Instances ({instances.length})</h2>
        <div className="mt-3 space-y-3">
          {instances.map(i => (
            <div key={i.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="text-sm font-semibold text-text-primary">{i.name} <span className="text-text-secondary">· {i.kind} · {i.sizeTier} · {i.region}</span></div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4 text-xs">
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">vCPU / Mem</div><div className="font-semibold text-text-primary">{i.vcpu} / {i.memoryGb}GB</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Utilization</div><div className="font-semibold text-text-primary">{i.utilizationPct.toFixed(1)}%</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Monthly cost</div><div className="font-semibold text-text-primary">${i.monthlyCostUsd.toFixed(2)}</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Autoscaling</div><div className="font-semibold text-text-primary">{i.autoscaling ? "On" : "Off"}</div></div>
              </div>
            </div>
          ))}
          {instances.length === 0 && <p className="text-sm text-text-secondary">No compute instances yet.</p>}
        </div>
      </section>
    </div>
  );
}

function NetworkPanel({ online }: { online: boolean | null }) {
  const [topologies, setTopologies] = useState<NetworkTopology[]>([]);
  const [form, setForm] = useState({ name: "", cidr: "10.0.0.0/16", region: "us-east-1", subnetCount: 4, peeredWithRaw: "" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setTopologies((await api<{ topologies: NetworkTopology[] }>("/v1/hivenetwork/topologies")).topologies); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const provision = async () => {
    if (!form.name.trim() || !form.cidr.trim()) return;
    setBusy(true);
    try {
      const peeredWith = form.peeredWithRaw.split(",").map(s => s.trim()).filter(Boolean);
      await api("/v1/hivenetwork/topologies", { method: "POST", body: JSON.stringify({ name: form.name, cidr: form.cidr, region: form.region, subnetCount: form.subnetCount, peeredWith }) });
      setForm(f => ({ ...f, name: "", peeredWithRaw: "" }));
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Provision network topology</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="prod-vpc" /></Field>
          <Field label="CIDR"><input className={inputCls} value={form.cidr} onChange={e => setForm(f => ({ ...f, cidr: e.target.value }))} /></Field>
          <Field label="Region"><input className={inputCls} value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} /></Field>
          <Field label="Subnets"><input type="number" min={1} className={inputCls} value={form.subnetCount} onChange={e => setForm(f => ({ ...f, subnetCount: Number(e.target.value) }))} /></Field>
          <Field label="Peered with (comma-sep)"><input className={inputCls} value={form.peeredWithRaw} onChange={e => setForm(f => ({ ...f, peeredWithRaw: e.target.value }))} placeholder="vpc-a, vpc-b" /></Field>
        </div>
        <button onClick={provision} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Provisioning…" : "Provision topology"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Topologies ({topologies.length})</h2>
        <div className="mt-3 space-y-3">
          {topologies.map(t => (
            <div key={t.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="text-sm font-semibold text-text-primary">{t.name} <span className="text-text-secondary">· {t.cidr} · {t.region}</span></div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4 text-xs">
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Subnets</div><div className="font-semibold text-text-primary">{t.subnetCount}</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Latency est.</div><div className="font-semibold text-text-primary">{t.latencyMsEstimate.toFixed(1)}ms</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Throughput</div><div className="font-semibold text-text-primary">{t.throughputGbps.toFixed(1)} Gbps</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Monthly cost</div><div className="font-semibold text-text-primary">${t.monthlyCostUsd.toFixed(2)}</div></div>
              </div>
              {t.peeredWith.length > 0 && <p className="mt-2 text-xs text-text-secondary">Peered with: {t.peeredWith.join(", ")}</p>}
            </div>
          ))}
          {topologies.length === 0 && <p className="text-sm text-text-secondary">No network topologies yet.</p>}
        </div>
      </section>
    </div>
  );
}

function IdentityPanel({ online }: { online: boolean | null }) {
  const [roles, setRoles] = useState<IdentityRole[]>([]);
  const [form, setForm] = useState({ name: "", permissionsRaw: "", mfaRequired: true, ssoProvider: "", memberCount: 5 });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setRoles((await api<{ roles: IdentityRole[] }>("/v1/hiveidentity/roles")).roles); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const provision = async () => {
    const permissions = form.permissionsRaw.split(",").map(s => s.trim()).filter(Boolean);
    if (!form.name.trim() || permissions.length === 0) return;
    setBusy(true);
    try {
      await api("/v1/hiveidentity/roles", { method: "POST", body: JSON.stringify({ name: form.name, permissions, mfaRequired: form.mfaRequired, ssoProvider: form.ssoProvider || undefined, memberCount: form.memberCount }) });
      setForm(f => ({ ...f, name: "", permissionsRaw: "" }));
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Create identity role</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="billing-admin" /></Field>
          <Field label="Permissions (comma-sep)"><input className={inputCls} value={form.permissionsRaw} onChange={e => setForm(f => ({ ...f, permissionsRaw: e.target.value }))} placeholder="billing:*, admin:read" /></Field>
          <Field label="MFA required"><select className={inputCls} value={form.mfaRequired ? "yes" : "no"} onChange={e => setForm(f => ({ ...f, mfaRequired: e.target.value === "yes" }))}><option value="yes">Yes</option><option value="no">No</option></select></Field>
          <Field label="SSO provider"><input className={inputCls} value={form.ssoProvider} onChange={e => setForm(f => ({ ...f, ssoProvider: e.target.value }))} placeholder="Okta (optional)" /></Field>
          <Field label="Member count"><input type="number" min={0} className={inputCls} value={form.memberCount} onChange={e => setForm(f => ({ ...f, memberCount: Number(e.target.value) }))} /></Field>
        </div>
        <button onClick={provision} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Creating…" : "Create role"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Roles ({roles.length})</h2>
        <div className="mt-3 space-y-3">
          {roles.map(r => (
            <div key={r.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-text-primary">{r.name}</div>
                <div className={`text-xs font-semibold ${r.riskScore >= 60 ? "text-red-400" : r.riskScore >= 35 ? "text-yellow-400" : "text-primary-accent"}`}>Risk {r.riskScore}/100</div>
              </div>
              <p className="mt-1 text-xs text-text-secondary">Permissions: {r.permissions.join(", ")}</p>
              <p className="mt-0.5 text-xs text-text-secondary">MFA: {r.mfaRequired ? "Required" : "Not required"} · SSO: {r.ssoProvider ?? "None"} · Members: {r.memberCount}</p>
              {r.riskFactors.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-text-secondary">{r.riskFactors.map((f, i) => <li key={i}>• {f}</li>)}</ul>
              )}
            </div>
          ))}
          {roles.length === 0 && <p className="text-sm text-text-secondary">No identity roles yet.</p>}
        </div>
      </section>
    </div>
  );
}

function MonitorPanel({ online }: { online: boolean | null }) {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [form, setForm] = useState({ serviceName: "", metric: "latency_p99", thresholdWarning: 200, thresholdCritical: 500, alertChannelsRaw: "" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setMonitors((await api<{ monitors: Monitor[] }>("/v1/hivemonitor/monitors")).monitors); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const create = async () => {
    if (!form.serviceName.trim() || !form.metric.trim()) return;
    setBusy(true);
    try {
      const alertChannels = form.alertChannelsRaw.split(",").map(s => s.trim()).filter(Boolean);
      await api("/v1/hivemonitor/monitors", { method: "POST", body: JSON.stringify({ serviceName: form.serviceName, metric: form.metric, thresholdWarning: form.thresholdWarning, thresholdCritical: form.thresholdCritical, alertChannels }) });
      setForm(f => ({ ...f, serviceName: "" }));
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const statusColor: Record<Monitor["status"], string> = { healthy: "text-primary-accent", degraded: "text-yellow-400", critical: "text-red-400" };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Create monitor</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          <Field label="Service"><input className={inputCls} value={form.serviceName} onChange={e => setForm(f => ({ ...f, serviceName: e.target.value }))} placeholder="checkout-api" /></Field>
          <Field label="Metric"><input className={inputCls} value={form.metric} onChange={e => setForm(f => ({ ...f, metric: e.target.value }))} /></Field>
          <Field label="Warning threshold"><input type="number" className={inputCls} value={form.thresholdWarning} onChange={e => setForm(f => ({ ...f, thresholdWarning: Number(e.target.value) }))} /></Field>
          <Field label="Critical threshold"><input type="number" className={inputCls} value={form.thresholdCritical} onChange={e => setForm(f => ({ ...f, thresholdCritical: Number(e.target.value) }))} /></Field>
          <Field label="Alert channels (comma-sep)"><input className={inputCls} value={form.alertChannelsRaw} onChange={e => setForm(f => ({ ...f, alertChannelsRaw: e.target.value }))} placeholder="#alerts, pagerduty" /></Field>
        </div>
        <button onClick={create} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Creating…" : "Create monitor"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Monitors ({monitors.length})</h2>
        <div className="mt-3 space-y-3">
          {monitors.map(m => (
            <div key={m.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-text-primary">{m.serviceName} <span className="text-text-secondary">· {m.metric}</span></div>
                <div className={`text-xs font-semibold uppercase ${statusColor[m.status]}`}>{m.status}</div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3 text-xs">
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Uptime (30d)</div><div className="font-semibold text-text-primary">{m.uptimePct.toFixed(2)}%</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Incidents (30d)</div><div className="font-semibold text-text-primary">{m.incidentsLast30d}</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Alert channels</div><div className="font-semibold text-text-primary">{m.alertChannels.length || "None"}</div></div>
              </div>
            </div>
          ))}
          {monitors.length === 0 && <p className="text-sm text-text-secondary">No monitors yet.</p>}
        </div>
      </section>
    </div>
  );
}

function ApiPanel({ online }: { online: boolean | null }) {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [form, setForm] = useState({ name: "", method: "GET" as HttpMethod, path: "/v1/", authType: "api-key" as ApiAuthType, rateLimitPerMin: 600 });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setEndpoints((await api<{ endpoints: ApiEndpoint[] }>("/v1/hiveapi/endpoints")).endpoints); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  const register = async () => {
    if (!form.name.trim() || !form.path.startsWith("/")) return;
    setBusy(true);
    try { await api("/v1/hiveapi/endpoints", { method: "POST", body: JSON.stringify(form) }); setForm(f => ({ ...f, name: "" })); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Register API endpoint</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="get-orders" /></Field>
          <Field label="Method"><select className={inputCls} value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value as HttpMethod }))}>{HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
          <Field label="Path"><input className={inputCls} value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} placeholder="/v1/orders" /></Field>
          <Field label="Auth type"><select className={inputCls} value={form.authType} onChange={e => setForm(f => ({ ...f, authType: e.target.value as ApiAuthType }))}>{AUTH_TYPES.map(a => <option key={a} value={a}>{a}</option>)}</select></Field>
          <Field label="Rate limit / min"><input type="number" min={1} className={inputCls} value={form.rateLimitPerMin} onChange={e => setForm(f => ({ ...f, rateLimitPerMin: Number(e.target.value) }))} /></Field>
        </div>
        <button onClick={register} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Registering…" : "Register endpoint"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Endpoints ({endpoints.length})</h2>
        <div className="mt-3 space-y-3">
          {endpoints.map(e => (
            <div key={e.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="text-sm font-semibold text-text-primary">{e.method} {e.path} <span className="text-text-secondary">· {e.name}</span></div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4 text-xs">
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Auth</div><div className="font-semibold text-text-primary">{e.authType}</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Monthly calls</div><div className="font-semibold text-text-primary">{e.monthlyCalls.toLocaleString()}</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Avg latency</div><div className="font-semibold text-text-primary">{e.avgLatencyMs.toFixed(0)}ms</div></div>
                <div className="rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5"><div className="text-text-secondary">Error rate</div><div className="font-semibold text-text-primary">{e.errorRatePct.toFixed(2)}%</div></div>
              </div>
            </div>
          ))}
          {endpoints.length === 0 && <p className="text-sm text-text-secondary">No API endpoints yet.</p>}
        </div>
      </section>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number; className?: string }>][] = [
  ["cloud", "HiveCloud™", Cloud],
  ["storage", "HiveStorage™", Database],
  ["compute", "HiveCompute™", Cpu],
  ["network", "HiveNetwork™", Network],
  ["identity", "HiveIdentity™", Lock],
  ["monitor", "HiveMonitor™", Activity],
  ["api", "HiveAPI™", Code2],
];

export default function HiveInfraPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("cloud");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">Hive Infrastructure Suite</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Cloud, storage, compute, network, identity, monitoring, and API infrastructure — governed and simulated</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        HiveCloud™, HiveStorage™, HiveCompute™, HiveNetwork™, HiveIdentity™, HiveMonitor™, and HiveAPI™ form a
        governed-simulation infrastructure control plane: provision resources, see deterministic cost and risk
        scoring, and manage them from one console. This is a control-plane layer over simulated infrastructure,
        not a live AWS/Azure/GCP provisioning integration — that would require real cloud credentials this
        platform doesn't have.
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

      {tab === "cloud" && <CloudPanel online={online} />}
      {tab === "storage" && <StoragePanel online={online} />}
      {tab === "compute" && <ComputePanel online={online} />}
      {tab === "network" && <NetworkPanel online={online} />}
      {tab === "identity" && <IdentityPanel online={online} />}
      {tab === "monitor" && <MonitorPanel online={online} />}
      {tab === "api" && <ApiPanel online={online} />}
    </main>
  );
}
