/**
 * Phase 9g-3 — the same deterministic-testability seam `Clock.ts` (Phase
 * 9f-1) established for "now," applied to "run this repeatedly." A real
 * `setInterval`/`clearInterval` pair is impossible to test deterministically
 * (it genuinely waits); `TimerSource` lets `ExecutionLeaseHeartbeat.ts`
 * depend on an abstraction a test can drive manually (a fake that fires its
 * registered callback on command) instead of real elapsed time, the same
 * reason `ExecutionScheduler.ts` (Phase 9g-2) never uses a real timer
 * itself.
 */
export type TimerHandle = unknown;

export interface TimerSource {
  setInterval(callback: () => void, intervalMs: number): TimerHandle;
  clearInterval(handle: TimerHandle): void;
}

/** The real, production default — a thin wrapper over the global
 * `setInterval`/`clearInterval`. */
export class RealTimerSource implements TimerSource {
  setInterval(callback: () => void, intervalMs: number): TimerHandle {
    return setInterval(callback, intervalMs);
  }

  clearInterval(handle: TimerHandle): void {
    clearInterval(handle as ReturnType<typeof setInterval>);
  }
}
