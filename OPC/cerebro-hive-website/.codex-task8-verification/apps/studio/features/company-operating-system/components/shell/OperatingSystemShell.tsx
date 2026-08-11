import Link from "next/link";
import type { DemoMode } from "@cerebro/shared-types";
import {
  Activity,
  BrainCircuit,
  Building2,
  ListTodo,
} from "lucide-react";
import type { ReactNode } from "react";

export interface OperatingSystemShellProps {
  children: ReactNode;
  header?: ReactNode;
  inspector?: ReactNode;
  mode: DemoMode;
  status?: ReactNode;
}

const mobileNavigation = [
  { href: "/app/brain", label: "Brain", icon: BrainCircuit },
  { href: "/app/departments", label: "Departments", icon: Building2 },
  { href: "/app/tasks", label: "Tasks", icon: ListTodo },
  { href: "/app/activity", label: "Activity", icon: Activity },
] as const;

export function OperatingSystemShell({
  children,
  header,
  inspector,
  mode,
  status,
}: OperatingSystemShellProps) {
  return (
    <section className="company-os-shell flex h-full min-h-0 max-h-full w-full flex-col bg-[var(--company-os-canvas)] text-[var(--company-os-text)]">
      <header
        aria-label="Company operating system controls"
        className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--company-os-border)] bg-[var(--company-os-panel)] px-3 py-2 sm:px-4"
      >
        <div className="min-w-0 flex-1">{header}</div>
        {mode === "demo" ? (
          <span className="shrink-0 border border-[var(--company-os-warning)] px-2 py-1 font-plex text-[10px] font-semibold tracking-[0.16em] text-[var(--company-os-warning)]">
            DEMO DATA
          </span>
        ) : null}
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <section
          aria-label="Company operating system visualization"
          className="company-os-grid h-full min-h-0 overflow-auto"
        >
          {children}
        </section>
        <aside
          aria-label="Entity inspector"
          aria-hidden={inspector ? undefined : true}
          className="pointer-events-none absolute inset-y-0 right-0 z-20 flex max-w-full items-stretch"
          data-company-os-inspector-portal=""
        >
          <div className="pointer-events-auto max-w-full">{inspector}</div>
        </aside>
      </div>

      <div
        aria-label="Company operating system status"
        className="company-os-status-rail min-h-7 shrink-0 border-t border-[var(--company-os-border)] bg-[var(--company-os-panel)] px-3 py-1 font-plex text-[10px] text-[var(--company-os-text-muted)] sm:px-4"
        role="status"
      >
        {status}
      </div>

      <nav
        aria-label="Company operating system"
        className="grid shrink-0 grid-cols-4 border-t border-[var(--company-os-border)] bg-[var(--company-os-panel)] pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {mobileNavigation.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            className="flex min-h-12 flex-col items-center justify-center gap-1 px-1 py-2 font-inter text-[10px] text-[var(--company-os-text-muted)] transition-colors hover:text-[var(--company-os-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--company-os-border-focus)]"
            href={href}
          >
            <Icon aria-hidden="true" size={15} strokeWidth={1.75} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
