"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WorkflowRunButton({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const [summary, setSummary] = useState<string | null>(null);

  async function run() {
    const res = await fetch(`/api/workflows/${workflowId}/run`, { method: "POST" });
    const json = (await res.json()) as { summary?: string };
    setSummary(json.summary ?? "done");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        className="border border-os-border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
      >
        Run workflow
      </button>
      {summary ? <p className="mt-2 text-[11px] text-os-muted">{summary}</p> : null}
    </div>
  );
}
