"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, HardDrive, Plus, Play, BookOpen } from "lucide-react";
import { api, checkOnline, type ToolDef, type ToolKind } from "./lib";

type Tab = "registry" | "register" | "catalog";

const inputCls =
  "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary =
  "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

const KIND_COLORS: Record<ToolKind, string> = {
  builtin: "text-primary-accent border-primary-accent/40 bg-primary-accent/10",
  mcp: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  custom: "text-purple-400 border-purple-400/40 bg-purple-400/10",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function RegistryPanel({ online }: { online: boolean | null }) {
  const [tools, setTools] = useState<ToolDef[]>([]);
  const [invoking, setInvoking] = useState<string | null>(null);
  const [invokeArgs, setInvokeArgs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!online) return;
    try { setTools(await api<ToolDef[]>("/tools")); } catch { /* noop */ }
  }, [online]);

  useEffect(() => {
    void refresh();
    const id = setInterval(refresh, 6000);
    return () => clearInterval(id);
  }, [refresh]);

  const invoke = async (name: string) => {
    setInvoking(name);
    try {
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(invokeArgs[name] || "{}"); } catch { /* noop */ }
      const r = await api<{ result?: unknown }>(`/tools/${name}/invoke`, {
        method: "POST",
        body: JSON.stringify({ args }),
      });
      setResults(prev => ({ ...prev, [name]: r.result ?? r }));
    } catch (e) {
      setResults(prev => ({ ...prev, [name]: String(e) }));
    } finally {
      setInvoking(null);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">
        HiveStorage manages the tool registry — the catalogue of every capability available to agents. Each tool has a name, kind (builtin / MCP / custom), input schema, and permission set. Agents must receive an explicit grant before invoking any tool.
      </p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">{tools.length} registered tools</p>
        <button onClick={() => void refresh()} className={btnPrimary}>Refresh</button>
      </div>
      <div className="space-y-2">
        {tools.map(t => (
          <div key={t.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div
              className="flex cursor-pointer items-start justify-between gap-2"
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              <div>
                <span className="font-semibold text-text-primary">{t.name}</span>
                {t.description && (
                  <p className="mt-0.5 text-xs text-text-secondary">{t.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${KIND_COLORS[t.kind as ToolKind] ?? ""}`}>
                  {t.kind}
                </span>
                {!t.enabled && (
                  <span className="inline-flex items-center rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
                    disabled
                  </span>
                )}
              </div>
            </div>
            {expanded === t.id && (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Input schema</p>
                  <pre className="mt-1 overflow-auto rounded-md bg-surface-elevated/40 p-2 text-xs text-text-primary">
                    {JSON.stringify(t.input_schema, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Permissions</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {t.permissions.map(p => (
                      <span key={p} className="rounded-full border border-border bg-surface/40 px-2 py-0.5 text-xs text-text-secondary">{p}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Field label="Args (JSON)">
                      <input
                        className={inputCls}
                        value={invokeArgs[t.name] ?? "{}"}
                        onChange={e => setInvokeArgs(prev => ({ ...prev, [t.name]: e.target.value }))}
                        placeholder='{"key": "value"}'
                      />
                    </Field>
                  </div>
                  <button
                    onClick={() => invoke(t.name)}
                    disabled={!online || invoking === t.name || !t.enabled}
                    className={`shrink-0 inline-flex items-center gap-1.5 ${btnPrimary}`}
                  >
                    <Play size={12} />
                    {invoking === t.name ? "Running…" : "Invoke"}
                  </button>
                </div>
                {results[t.name] !== undefined && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Result</p>
                    <pre className="mt-1 overflow-auto rounded-md bg-surface-elevated/40 p-2 text-xs text-text-primary">
                      {JSON.stringify(results[t.name], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {tools.length === 0 && (
          <p className="text-sm text-text-secondary">No tools registered. Register one from the Register tab or check the builtin catalog.</p>
        )}
      </div>
    </div>
  );
}

function RegisterPanel({ online, onCreated }: { online: boolean | null; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    kind: "custom" as ToolKind,
    input_schema: "{}",
    permissions: "execute",
  });
  const [schemaErr, setSchemaErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<ToolDef | null>(null);

  const validateSchema = (v: string) => {
    try { JSON.parse(v); setSchemaErr(""); } catch (e) { setSchemaErr(String(e)); }
  };

  const register = async () => {
    if (!form.name.trim() || schemaErr) return;
    setBusy(true);
    try {
      const t = await api<ToolDef>("/tools", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          kind: form.kind,
          input_schema: JSON.parse(form.input_schema),
          permissions: form.permissions.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      setCreated(t);
      onCreated();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">
        Register a new tool in the platform tool store. Once registered, the tool is available for agent tool grants. Builtin tools map to platform services; MCP tools connect to external MCP servers; custom tools are user-defined functions.
      </p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">New tool</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="web_search" />
          </Field>
          <Field label="Kind">
            <select className={inputCls} value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value as ToolKind }))}>
              <option value="builtin">builtin</option>
              <option value="mcp">mcp</option>
              <option value="custom">custom</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <input className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Search the web for a query string" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Input schema (JSON)">
              <textarea
                className={`${inputCls} min-h-[100px] font-mono text-xs`}
                value={form.input_schema}
                onChange={e => { setForm(f => ({ ...f, input_schema: e.target.value })); validateSchema(e.target.value); }}
                spellCheck={false}
              />
            </Field>
            {schemaErr && <p className="mt-1 text-xs text-red-400">{schemaErr}</p>}
          </div>
          <div className="sm:col-span-2">
            <Field label="Permissions (comma-separated)">
              <input className={inputCls} value={form.permissions} onChange={e => setForm(f => ({ ...f, permissions: e.target.value }))} placeholder="execute, read" />
            </Field>
          </div>
        </div>
        <button onClick={register} disabled={busy || !online || !form.name.trim() || !!schemaErr} className={`inline-flex items-center gap-1.5 ${btnPrimary}`}>
          <Plus size={12} />{busy ? "Registering…" : "Register tool"}
        </button>
        {created && (
          <p className="text-xs text-primary-accent">Registered <code>{created.name}</code> (id: {created.id})</p>
        )}
      </section>
    </div>
  );
}

function CatalogPanel({ online }: { online: boolean | null }) {
  const [catalog, setCatalog] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!online) return;
    api<Record<string, unknown>>("/tools/builtins/catalog").then(setCatalog).catch(() => { /* noop */ });
  }, [online]);

  const entries = Object.entries(catalog);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-text-secondary">
        The builtin catalog lists every tool natively implemented in the platform — no external integration required. These tools are always available for grant to any agent.
      </p>
      {entries.length === 0
        ? <p className="text-sm text-text-secondary">No builtin tools available, or platform is offline.</p>
        : <div className="space-y-2">
            {entries.map(([name, schema]) => (
              <div key={name} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{name}</span>
                  <span className="inline-flex items-center rounded-full border border-primary-accent/40 bg-primary-accent/10 px-2 py-0.5 text-xs font-semibold text-primary-accent">builtin</span>
                </div>
                <pre className="mt-2 overflow-auto text-xs text-text-secondary">{JSON.stringify(schema, null, 2)}</pre>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["registry", "Tool Registry", HardDrive],
  ["register", "Register Tool", Plus],
  ["catalog", "Builtin Catalog", BookOpen],
];

export default function HiveStoragePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("registry");
  const [, setTick] = useState(0);

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link
        href="/platform"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"
      >
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">
        HiveStorage™ · Tier 1
      </p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">
        Tool registry — register, inspect, and invoke platform capabilities
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        HiveStorage is the platform tool store. Every capability an agent can invoke — builtin platform functions, external MCP servers, or custom integrations — is registered here with its input schema and permission requirements. Agents can only use tools they've been explicitly granted.
      </p>
      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">
          {online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}
        </span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === "registry" && <RegistryPanel online={online} />}
      {tab === "register" && <RegisterPanel online={online} onCreated={() => setTick(t => t + 1)} />}
      {tab === "catalog" && <CatalogPanel online={online} />}
    </main>
  );
}
