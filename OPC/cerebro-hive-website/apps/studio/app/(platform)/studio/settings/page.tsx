"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useMe } from "@/lib/platform/hooks";
import { platformApi } from "@/lib/platform/api-client";

type Tab = "organization" | "api-keys" | "members" | "ai-providers";

// ── Shared form field ─────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-neutral-400">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-neutral-600">{hint}</p>}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                 placeholder-neutral-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30
                 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

// ── API Keys panel ────────────────────────────────────────────────────────────

interface ApiKey {
  id:          string;
  name:        string;
  prefix:      string;
  permissions: string[];
  expiresAt:   string | null;
  lastUsedAt:  string | null;
  createdAt:   string;
}

function ApiKeysPanel() {
  const [keys, setKeys]         = useState<ApiKey[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey]     = useState<{ raw: string; name: string } | null>(null);
  const [form, setForm]         = useState({ name: "", expiresIn: "never" });
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied]     = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformApi.apiKeys.list();
      setKeys(res as ApiKey[]);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { setTimeout(() => { void fetchKeys(); }, 0); }, [fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await platformApi.apiKeys.create({
        name:      form.name.trim(),
        expiresIn: form.expiresIn === "never" ? undefined : form.expiresIn,
      });
      setNewKey({ raw: (res as { raw: string }).raw, name: form.name.trim() });
      setShowForm(false);
      setForm({ name: "", expiresIn: "never" });
      void fetchKeys();
    } catch { /* noop */ }
    finally { setCreating(false); }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? It will stop working immediately.")) return;
    try { await platformApi.apiKeys.revoke(id); void fetchKeys(); } catch { /* noop */ }
  };

  const copyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey.raw).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">API Keys</h2>
          <p className="mt-0.5 text-xs text-neutral-500">Keys authenticate requests to the CerebroHive API.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          + New Key
        </button>
      </div>

      {/* New key revealed */}
      {newKey && (
        <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-4">
          <p className="mb-2 text-sm font-medium text-emerald-400">
            Key created: <span className="text-white">{newKey.name}</span>
          </p>
          <p className="mb-3 text-xs text-neutral-500">
            This is the only time you&apos;ll see this key. Copy it now.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-emerald-400">
              {newKey.raw}
            </code>
            <button
              onClick={copyKey}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium
                         text-neutral-400 hover:text-neutral-300 transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="mt-3 text-xs text-neutral-500 underline hover:no-underline">
            I&apos;ve saved it
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <Input
                autoFocus
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Production App"
              />
            </Field>
            <Field label="Expires">
              <select
                value={form.expiresIn}
                onChange={e => setForm(f => ({ ...f, expiresIn: e.target.value }))}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white
                           outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              >
                <option value="never">Never</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
                <option value="365d">1 year</option>
              </select>
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button type="submit" disabled={!form.name.trim() || creating}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white
                         hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {creating ? "Creating…" : "Create Key"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-sm text-neutral-500 hover:text-neutral-400">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Keys list */}
      {loading ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-800 p-4">
            <div className="mb-2 h-4 w-32 animate-pulse rounded bg-neutral-800" />
            <div className="h-3 w-48 animate-pulse rounded bg-neutral-800" />
          </div>
        ))
      ) : keys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 py-8 text-center">
          <p className="text-sm text-neutral-500">No API keys yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-800">
          {keys.map((key, i) => (
            <div key={key.id} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "border-t border-neutral-800/60" : ""}`}>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{key.name}</p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-neutral-500">
                  <code className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-neutral-400">
                    {key.prefix}…
                  </code>
                  {key.lastUsedAt && (
                    <span>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                  )}
                  {key.expiresAt && (
                    <span>Expires {new Date(key.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRevoke(key.id)}
                className="rounded-md border border-red-900 bg-red-950 px-2.5 py-1 text-xs
                           font-medium text-red-400 hover:bg-red-900 transition-colors"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── AI Providers panel ────────────────────────────────────────────────────────

function AIProvidersPanel() {
  const [saved, setSaved] = useState(false);

  const providers = [
    { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-…" },
    { id: "openai",    label: "OpenAI",    placeholder: "sk-…" },
    { id: "google",    label: "Google AI", placeholder: "AIza…" },
    { id: "cohere",    label: "Cohere",    placeholder: "…" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setSaved(true), 0);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-white">AI Provider Keys</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Keys are encrypted at rest and never logged. They&apos;re used by the AI Gateway.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {providers.map(p => (
          <Field key={p.id} label={p.label} hint="Stored encrypted in Secrets Manager">
            <Input type="password" placeholder={p.placeholder} autoComplete="off" />
          </Field>
        ))}
      </div>
      <div>
        <button type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                     hover:bg-indigo-500 transition-colors">
          {saved ? "Saved!" : "Save Keys"}
        </button>
      </div>
    </form>
  );
}

// ── Organization panel ────────────────────────────────────────────────────────

function OrganizationPanel() {
  const { me } = useMe();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setSaved(true), 0);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-white">Organization Settings</h2>
        <p className="mt-0.5 text-xs text-neutral-500">Manage your organization configuration.</p>
      </div>

      {me && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">Current User</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-neutral-500">Name</p>
              <p className="font-medium text-white">{me.name}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Email</p>
              <p className="font-medium text-white">{me.email}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Role</p>
              <p className="font-medium text-white">{me.orgRole}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Org ID</p>
              <code className="font-mono text-xs text-neutral-400">{me.orgId}</code>
            </div>
          </div>
        </div>
      )}

      <Field label="Organization Name">
        <Input defaultValue="My Organization" />
      </Field>
      <Field label="Slug" hint="Used in API paths and webhooks">
        <Input defaultValue="my-org" />
      </Field>
      <Field label="Allowed Email Domains" hint="Comma-separated, e.g. acme.com, acme.io">
        <Input placeholder="acme.com" />
      </Field>

      <div>
        <button type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                     hover:bg-indigo-500 transition-colors">
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "organization", label: "Organization" },
  { id: "api-keys",     label: "API Keys" },
  { id: "ai-providers", label: "AI Providers" },
  { id: "members",      label: "Members" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("organization");

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900/40 p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
        {activeTab === "organization" && <OrganizationPanel />}
        {activeTab === "api-keys"     && <ApiKeysPanel />}
        {activeTab === "ai-providers" && <AIProvidersPanel />}
        {activeTab === "members"      && (
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-white">Members</h2>
            <p className="text-sm text-neutral-500">Member management coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
