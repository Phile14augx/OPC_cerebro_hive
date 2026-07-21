"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api, checkOnline, KEY, type Workspace } from "./lib";

export default function StudioHubPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      setWorkspaces((await api<{ workspaces: Workspace[] }>("/v1/cerebrostudio/workspaces")).workspaces);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const createWorkspace = useCallback(async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api("/v1/cerebrostudio/workspaces", { method: "POST", body: JSON.stringify({ name, description }) });
      setName(""); setDescription("");
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [name, description, refresh]);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <h1 className="mt-5 text-3xl font-bold text-text-primary md:text-4xl">CerebroStudio™</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        The full IDE-style AI development workspace — build versioned prompts, configure agents, chain them into flows,
        prototype in cell-based notebooks, and attach datasets, all inside a workspace and runnable end to end.
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <section className="mt-8 rounded-xl border border-border bg-surface/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">New workspace</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_2fr_auto]">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Workspace name" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <button onClick={() => void createWorkspace()} disabled={busy || !online || !KEY || !name.trim()} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
            {busy ? "Creating…" : "Create workspace"}
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Your workspaces</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {workspaces.map(w => (
            <Link key={w.id} href={`/platform/studio/${w.id}`} className="group flex items-center justify-between rounded-xl border border-border bg-surface/40 px-5 py-4 transition-colors hover:border-primary-accent">
              <div>
                <div className="text-sm font-semibold text-text-primary">{w.name}</div>
                <div className="mt-1 text-xs text-text-secondary">{w.description || "No description"} · created {new Date(w.createdAt).toLocaleDateString()}</div>
              </div>
              <ArrowRight size={16} className="text-text-secondary transition-colors group-hover:text-primary-accent" />
            </Link>
          ))}
          {workspaces.length === 0 && <p className="text-sm text-text-secondary">No workspaces yet — create one above to get started.</p>}
        </div>
      </section>
    </main>
  );
}
