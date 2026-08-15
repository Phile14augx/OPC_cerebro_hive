"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StatementUploader() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onFile(file: File) {
    setError(null);
    setOk(null);
    const text = await file.text();
    const res = await fetch("/api/finances/statements", {
      method: "POST",
      headers: { "content-type": "text/csv" },
      body: text,
    });
    const json = (await res.json()) as { error?: string; inserted?: number };
    if (!res.ok) setError(json.error ?? "Upload refused.");
    else {
      setOk(`Inserted ${json.inserted} rows.`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
        }}
        className="text-[11px] text-os-muted"
      />
      {error ? <p className="text-[11px] text-os-err">{error}</p> : null}
      {ok ? <p className="text-[11px] text-os-ok">{ok}</p> : null}
    </div>
  );
}
