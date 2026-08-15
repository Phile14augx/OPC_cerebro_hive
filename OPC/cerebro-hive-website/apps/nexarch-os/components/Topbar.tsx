"use client";

import { usePathname } from "next/navigation";
import { Kbd } from "@/components/terminal";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Topbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-os-border bg-os-bg/90 px-6 backdrop-blur">
      <div className="text-[11px] uppercase tracking-[0.2em] text-os-muted">{pathname === "/" ? "/console" : pathname}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("nexarch:palette"))}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-os-muted"
        >
          Command <Kbd>⌘K</Kbd>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
