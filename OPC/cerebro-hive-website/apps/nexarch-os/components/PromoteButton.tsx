"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PromoteButton({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function promote() {
    setBusy(true);
    try {
      await fetch(`/api/brain/claims/${claimId}/promote`, { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={promote}
      disabled={busy}
      className="border border-os-border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
    >
      {busy ? "Promoting" : "Promote to fact"}
    </button>
  );
}
