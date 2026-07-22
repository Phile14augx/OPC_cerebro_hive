"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface ToolGrant { id: string; agentId: string; tool: string; allow: boolean }
interface McpServer { id: string; name: string; riskTier: string; status: string }

export default function ZeroTrustPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [toolGrants, setToolGrants] = useState<ToolGrant[]>([]);
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      setToolGrants((await api<{ grants: ToolGrant[] }>("/v1/zerotrust/grants")).grants);
      setMcpServers((await api<{ servers: McpServer[] }>("/v1/zerotrust/mcp-servers")).servers);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const grantToolAccess = useCallback(async () => {
    setBusy(true);
    try {
      await api("/v1/zerotrust/grants", { method: "POST", body: JSON.stringify({ agentId: "runtime-agent-1", tool: "deploy_kubernetes", allow: true }) });
      setToolGrants((await api<{ grants: ToolGrant[] }>("/v1/zerotrust/grants")).grants);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, []);

  const registerMcpServer = useCallback(async () => {
    setBusy(true);
    try {
      await api("/v1/zerotrust/mcp-servers", { method: "POST", body: JSON.stringify({ name: "external-connector", url: "https://mcp.example.com", riskTier: "high", capabilities: ["read", "write"] }) });
      setMcpServers((await api<{ servers: McpServer[] }>("/v1/zerotrust/mcp-servers")).servers);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, []);

  return (
    <PillarShell slug="zero-trust" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-text-primary">Tool grants &amp; MCP server governance</h2>
          <div className="flex gap-2">
            <button onClick={() => void grantToolAccess()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">Grant tool</button>
            <button onClick={() => void registerMcpServer()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">Register MCP</button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <ul className="mt-4 space-y-1.5 text-sm">
          {toolGrants.map(g => (
            <li key={g.id} className="rounded-lg border border-border bg-background px-3 py-2">{g.agentId} → {g.tool}: <span className={g.allow ? "text-primary-accent" : "text-red-400"}>{g.allow ? "allow" : "deny"}</span></li>
          ))}
          {mcpServers.map(s => (
            <li key={s.id} className="rounded-lg border border-border bg-background px-3 py-2">{s.name} · {s.riskTier} · <span className={s.status === "approved" ? "text-primary-accent" : s.status === "pending" ? "text-amber-400" : "text-red-400"}>{s.status}</span></li>
          ))}
          {toolGrants.length === 0 && mcpServers.length === 0 && <li className="text-text-secondary">No grants or MCP servers registered yet.</li>}
        </ul>
      </section>
    </PillarShell>
  );
}
