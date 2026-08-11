"use client";

import { ArrowLeft } from "lucide-react";
import { osPillars } from "./lib";
import { TrackedLink } from "@/components/cerebro/TrackedLink";

export function PillarShell({
  slug,
  online,
  children,
}: {
  slug: string;
  online: boolean | null;
  children: React.ReactNode;
}) {
  const current = osPillars.find(p => p.slug === slug);
  const siblings = current ? osPillars.filter(p => p.group === current.group && p.slug !== slug) : [];

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <TrackedLink href="/platform/os" analyticsEvent="pillar_shell_back_click" analyticsCategory="platform-os" analyticsLabel="Enterprise AI OS Console" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Enterprise AI OS Console
      </TrackedLink>

      {current && (
        <>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">{current.group}</p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">{current.name}</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">{current.tagline}</p>
        </>
      )}

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <div className="mt-10">{children}</div>

      {siblings.length > 0 && (
        <section className="mt-16 border-t border-border pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">More in {current?.group}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {siblings.map(s => (
              <TrackedLink key={s.slug} href={`/platform/os/${s.slug}`} analyticsEvent="pillar_shell_sibling_click" analyticsCategory="platform-os" analyticsLabel={s.name} className="rounded-xl border border-border bg-surface/40 p-4 transition-colors hover:border-primary-accent">
                <div className="font-semibold text-text-primary">{s.name}</div>
                <p className="mt-1 text-xs text-text-secondary">{s.tagline}</p>
              </TrackedLink>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
