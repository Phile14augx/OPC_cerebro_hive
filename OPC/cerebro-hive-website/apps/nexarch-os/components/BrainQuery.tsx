"use client";

import { useState } from "react";

type Hit = { path: string; snippet: string };

export function BrainQuery() {
  const [q, setQ] = useState("execution plane");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function search() {
    setBusy(true);
    try {
      const res = await fetch(`/api/brain?q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as { hits?: Hit[]; provider?: string; detail?: string };
      setHits(json.hits ?? []);
      setProvider(json.provider ?? "grep");
      setDetail(json.detail ?? null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 border border-os-border bg-os-bg px-3 py-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={search}
          disabled={busy}
          className="border border-os-border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em]"
        >
          {busy ? "Search" : "Query"}
        </button>
      </div>
      {hits ? (
        <ul className="space-y-2">
          {provider ? (
            <li className="text-[11px] uppercase tracking-[0.12em] text-os-dim">
              {provider}
              {detail ? ` — ${detail}` : ""}
            </li>
          ) : null}
          {hits.length === 0 ? <li className="text-[12px] text-os-muted">No hits. Grep/pgvector both empty or not_configured.</li> : null}
          {hits.map((h) => (
            <li key={h.path} className="border border-os-border p-3">
              <div className="text-[11px] uppercase tracking-[0.12em] text-os-dim">{h.path}</div>
              <p className="mt-1 text-[12px] text-os-muted">{h.snippet}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
