/**
 * Phase 9f-1 — the seam through which `ExecutionOrchestrator` reads "now,"
 * so timeout semantics are deterministically testable (a real test drives a
 * `DeterministicClock` forward past a deadline rather than sleeping in real
 * time) without adding a second, parallel timing mechanism the orchestrator
 * would otherwise have to invent. `SystemClock` is the real, production
 * default; nothing here talks to any live scheduler or timer service —
 * wiring an actual recurring timeout-sweep process remains Phase 9g's job.
 */
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
