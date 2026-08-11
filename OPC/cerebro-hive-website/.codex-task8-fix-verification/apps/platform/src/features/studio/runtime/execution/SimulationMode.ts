/**
 * M24 — Simulation Modes
 *
 * OFFLINE  — no network; all nodes use deterministic stubs.
 * MOCK     — per-node mock functions; useful for unit tests.
 * RECORDED — replay a previously captured recording.
 * LIVE     — real gateway calls (requires API keys in env).
 * HYBRID   — nodes with a stub use it; others call LIVE.
 */
export type SimulationMode = 'OFFLINE' | 'MOCK' | 'RECORDED' | 'LIVE' | 'HYBRID';

export const DEFAULT_SIMULATION_MODE: SimulationMode =
  (process.env['NEXT_PUBLIC_SIMULATION_MODE'] as SimulationMode) ?? 'OFFLINE';
