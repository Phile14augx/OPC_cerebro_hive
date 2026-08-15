import type { ConnectorStatus } from "@/lib/schemas";

export function Dot({ status }: { status: ConnectorStatus | "active" | "paused" | "ok" | "warn" | "err" }) {
  const color =
    status === "connected" || status === "active" || status === "ok"
      ? "bg-os-ok"
      : status === "error" || status === "err"
        ? "bg-os-err"
        : status === "paused" || status === "warn"
          ? "bg-os-warn"
          : "bg-os-dim";
  return <span className={`inline-block h-2 w-2 ${color}`} aria-hidden />;
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-os-border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.26em] text-os-muted">
      {children}
    </span>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[9.5px] font-bold uppercase tracking-[0.32em] text-os-dim">// {children}</div>;
}

export function SectionHead({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[10px] font-bold uppercase tracking-[0.26em] text-os-muted">{children}</h2>;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="border border-os-border px-1 py-0.5 font-mono text-[10px] text-os-muted">{children}</kbd>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`border border-os-border bg-os-surface p-4 ${className}`}>{children}</section>;
}
