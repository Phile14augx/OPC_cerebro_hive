"use client";

import { useEffect, useState } from "react";

let revealCompletedForSession = false;

export function BrainInitialReveal() {
  const [stage, setStage] = useState(revealCompletedForSession ? 7 : 0);
  useEffect(() => {
    if (revealCompletedForSession) return;
    const timings = [100, 200, 300, 400, 500, 800, 1200].map((delay, index) => window.setTimeout(() => setStage(index + 1), delay));
    const completion = window.setTimeout(() => { revealCompletedForSession = true; }, 1200);
    return () => { timings.forEach(window.clearTimeout); window.clearTimeout(completion); };
  }, []);
  if (stage === 7 && revealCompletedForSession) return <p role="status" className="p-4 font-inter text-xs text-[var(--company-os-text-muted)]">Updating company brain…</p>;
  return <section aria-label="Loading company brain" className="relative h-full min-h-[32rem] overflow-hidden p-6">
    <div className="company-os-grid absolute inset-0" data-reveal="grid" data-visible={stage >= 1 ? "true" : "false"} />
    <p className="relative font-plex text-xs uppercase tracking-[0.16em] text-[var(--company-os-text-muted)]">Mapping company brain…</p>
    <div aria-hidden="true" data-stage={stage} />
    <span className="sr-only">The graph grid, context, core, department edges, departments, and agent ring are appearing.</span>
  </section>;
}
