"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReplyButton({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  async function reply() {
    const res = await fetch("/api/comms/reply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: threadId }),
    });
    const json = (await res.json()) as { status?: string; detail?: string };
    setMsg(json.detail ?? json.status ?? "done");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={reply}
        className="border border-os-border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
      >
        Reply
      </button>
      {msg ? <p className="mt-1 text-[11px] text-os-warn">{msg}</p> : null}
    </div>
  );
}
