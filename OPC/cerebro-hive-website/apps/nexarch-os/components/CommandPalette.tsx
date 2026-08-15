"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DIGIT_VIEWS, NAV_GROUPS } from "@/lib/nav";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const items = useMemo(
    () => NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.label.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key >= "1" && e.key <= "9" && !open) {
        const target = document.activeElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
        const href = DIGIT_VIEWS[Number(e.key) - 1];
        if (href) router.push(href);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("nexarch:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nexarch:palette", onOpen);
    };
  }, [open, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setOpen(false)}>
      <div
        className="mx-auto mt-32 w-full max-w-lg border border-os-border bg-os-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Jump to a view"
          className="w-full border-b border-os-border bg-transparent px-4 py-3 text-sm text-os-text outline-none"
        />
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm uppercase tracking-[0.06em] text-os-muted hover:bg-os-elevated hover:text-os-text"
                onClick={() => {
                  router.push(item.href);
                  setOpen(false);
                  setQ("");
                }}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
