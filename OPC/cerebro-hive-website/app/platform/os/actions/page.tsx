"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface ActionDefinition { kind: string; title: string; category: string; requiresApproval: boolean }
interface ActionExecution { id: string; kind: string; status: string; result?: Record<string, unknown> }

export default function ActionsPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [catalog, setCatalog] = useState<ActionDefinition[]>([]);
  const [log, setLog] = useState<ActionExecution[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      setCatalog((await api<{ actions: ActionDefinition[] }>("/v1/actions/catalog")).actions);
      setLog((await api<{ actions: ActionExecution[] }>("/v1/actions/log")).actions);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const executeAction = useCallback(async (kind: string, approved?: boolean) => {
    setBusy(kind);
    try {
      const params = kind === "create_jira_ticket" ? { project: "OPS" } : kind === "deploy_kubernetes" ? { deployment: "web-api", cluster: "prod" } : {};
      await api("/v1/actions/execute", { method: "POST", body: JSON.stringify({ kind, params, approved }) });
      setLog((await api<{ actions: ActionExecution[] }>("/v1/actions/log")).actions);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  }, []);

  return (
    <PillarShell slug="actions" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <p className="text-sm text-text-secondary">Governed enterprise action connectors; high-blast-radius actions require explicit approval before they run.</p>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {catalog.map(a => (
            <button
              key={a.kind}
              onClick={() => void executeAction(a.kind)}
              disabled={busy !== null || !online || !KEY}
              className="rounded-full border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40"
              title={a.requiresApproval ? "Requires approval" : undefined}
            >
              {busy === a.kind ? "…" : a.title}{a.requiresApproval ? " *" : ""}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-1.5 text-xs">
          {log.map(a => (
            <li key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5">
              <span className="text-text-primary">{a.kind}</span>
              <span className="flex items-center gap-2">
                {a.status === "pending_approval" && (
                  <button onClick={() => void executeAction(a.kind, true)} className="rounded border border-primary-accent px-2 py-0.5 text-[11px] text-primary-accent">Approve</button>
                )}
                <span className={a.status === "executed" ? "text-primary-accent" : a.status === "pending_approval" ? "text-amber-400" : "text-red-400"}>{a.status.replace(/_/g, " ")}</span>
              </span>
            </li>
          ))}
          {log.length === 0 && <li className="text-text-secondary">No actions executed yet.</li>}
        </ul>
        <p className="mt-2 text-xs text-text-secondary">* requires approval before execution</p>
      </section>
    </PillarShell>
  );
}
