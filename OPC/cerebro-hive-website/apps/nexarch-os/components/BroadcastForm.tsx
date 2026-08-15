"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BroadcastForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  async function send() {
    if (!message.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/agents/broadcast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = (await res.json()) as { replies?: unknown[] };
      setCount(json.replies?.length ?? 0);
      setMessage("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Broadcast to the company of agents"
        className="h-20 w-full border border-os-border bg-os-bg px-3 py-2 text-sm text-os-text outline-none"
      />
      <button
        type="button"
        onClick={send}
        disabled={busy}
        className="border border-os-border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
      >
        {busy ? "Sending" : "Broadcast"}
      </button>
      {count !== null ? <p className="text-[11px] text-os-ok">{count} replies persisted.</p> : null}
    </div>
  );
}
