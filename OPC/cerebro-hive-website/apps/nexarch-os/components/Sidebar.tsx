"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-os-border bg-os-bg">
      <div className="border-b border-os-border px-4 py-4">
        <div className="text-[9.5px] font-bold uppercase tracking-[0.32em] text-os-dim">// cerebro</div>
        <div className="mt-1 text-sm font-bold uppercase tracking-[0.08em]">Nexarch OS</div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="mb-5">
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-os-dim">{group.label}</div>
            {group.items.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-0.5 flex items-center gap-2 px-2 py-1.5 text-[12px] uppercase tracking-[0.04em] ${
                    active ? "bg-os-elevated text-os-accent" : "text-os-muted hover:text-os-text"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-os-border px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-os-dim">
        Operator Philemon
      </div>
    </aside>
  );
}
