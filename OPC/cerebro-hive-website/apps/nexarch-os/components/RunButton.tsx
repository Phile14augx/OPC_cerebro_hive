"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RunButton({ agentId, label = "Run" }: { agentId: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  async function run() {
    setBusy(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/run`, { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; summary?: string; error?: string };
      setOk(Boolean(json.ok));
      setSummary(json.summary ?? json.error ?? "No summary");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="border border-os-border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-os-text disabled:text-os-dim"
      >
        {busy ? "Running" : label}
      </button>
      {summary ? (
        <p className={`text-[11px] ${ok ? "text-os-ok" : "text-os-warn"}`}>{summary}</p>
      ) : null}
    </div>
  );
}
