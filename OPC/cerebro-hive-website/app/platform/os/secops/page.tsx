"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface ScanRun { id: string; kind: string; status: string; findings: { severity: string; rule: string }[] }
interface RedTeamResult { id: string; attacksRun: number; attacksSucceeded: number }

export default function SecOpsPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [scans, setScans] = useState<ScanRun[]>([]);
  const [redTeam, setRedTeam] = useState<RedTeamResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setScans((await api<{ scans: ScanRun[] }>("/v1/secops/scans")).scans); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const runScan = useCallback(async () => {
    setBusy("scan");
    try {
      await api("/v1/secops/scans", { method: "POST", body: JSON.stringify({ kind: "sast", target: "web-api" }) });
      setScans((await api<{ scans: ScanRun[] }>("/v1/secops/scans")).scans);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  }, []);

  const runRedTeam = useCallback(async () => {
    setBusy("redteam");
    try { setRedTeam(await api<RedTeamResult>("/v1/secops/redteam", { method: "POST", body: JSON.stringify({ targetKind: "agent", targetId: "runtime-agent-1" }) })); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  }, []);

  return (
    <PillarShell slug="secops" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Security scans &amp; red-team runs</h2>
          <div className="flex gap-2">
            <button onClick={() => void runScan()} disabled={busy !== null || !online || !KEY} className="rounded-lg border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">{busy === "scan" ? "…" : "Scan"}</button>
            <button onClick={() => void runRedTeam()} disabled={busy !== null || !online || !KEY} className="rounded-lg border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">{busy === "redteam" ? "…" : "Red-team"}</button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <ul className="mt-4 space-y-2 text-sm">
          {scans.map(s => (
            <li key={s.id} className="rounded-lg border border-border bg-background px-3 py-2">
              {s.kind} · <span className={s.status === "passed" ? "text-primary-accent" : "text-red-400"}>{s.status}</span> · {s.findings.length} findings
            </li>
          ))}
          {redTeam && <li className="rounded-lg border border-border bg-background px-3 py-2">Red-team: {redTeam.attacksSucceeded}/{redTeam.attacksRun} attacks succeeded</li>}
          {scans.length === 0 && !redTeam && <li className="text-text-secondary">No scans run yet.</li>}
        </ul>
      </section>
    </PillarShell>
  );
}
