"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface PromptVersion { id: string; name: string; version: number }
interface LeaderboardEntry { target: string; score: number; regression: boolean }

export default function ResearchPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setPromptVersions((await api<{ versions: PromptVersion[] }>("/v1/research/prompts")).versions); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const registerPromptVersion = useCallback(async () => {
    setBusy(true);
    try {
      await api("/v1/research/prompts", { method: "POST", body: JSON.stringify({ name: "grounded-qa", template: "Answer strictly from: {{sources}}" }) });
      setPromptVersions((await api<{ versions: PromptVersion[] }>("/v1/research/prompts")).versions);
      setLeaderboard((await api<{ entries: LeaderboardEntry[] }>("/v1/research/leaderboard/provider-compare")).entries);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, []);

  return (
    <PillarShell slug="research" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Prompt &amp; agent versioning</h2>
          <button onClick={() => void registerPromptVersion()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">Version prompt</button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <ul className="mt-4 space-y-1.5 text-sm">
          {promptVersions.map(v => (
            <li key={v.id} className="rounded-lg border border-border bg-background px-3 py-2">{v.name} · v{v.version}</li>
          ))}
          {promptVersions.length === 0 && <li className="text-text-secondary">No prompt versions registered yet.</li>}
        </ul>
        {leaderboard.length > 0 && (
          <div className="mt-3 text-xs text-text-secondary">Leaderboard: {leaderboard.map(l => `${l.target}=${l.score}`).join(", ")}</div>
        )}
      </section>
    </PillarShell>
  );
}
