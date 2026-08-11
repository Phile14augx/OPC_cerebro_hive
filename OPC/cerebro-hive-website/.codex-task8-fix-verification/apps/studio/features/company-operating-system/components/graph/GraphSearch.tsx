"use client";

import { Search } from "lucide-react";

export function GraphSearch({ query, onChange, inputRef }: { query: string; onChange: (query: string) => void; inputRef?: React.RefObject<HTMLInputElement | null> }) {
  return <label className="flex items-center gap-2 border border-[var(--company-os-border)] bg-[var(--company-os-panel)] px-2 py-1.5">
    <Search aria-hidden="true" size={14} />
    <input ref={inputRef} aria-label="Search company brain" className="w-44 bg-transparent font-inter text-xs outline-none" onChange={(event) => onChange(event.target.value)} placeholder="Search company brain" role="searchbox" value={query} />
  </label>;
}
