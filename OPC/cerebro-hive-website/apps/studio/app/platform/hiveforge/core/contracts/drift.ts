/**
 * Infrastructure Drift Detection Contracts
 */

export type DriftState = "Synchronized" | "Drifted" | "Unknown";

export interface DriftReport {
  resourceId: string;
  timestamp: string;
  state: DriftState;
  
  desiredState: unknown; // The Blueprint Intent
  observedState: unknown; // Provider API State
  actualState?: unknown; // Telemetry/Runtime State (if different from observed)
  
  differences: {
    path: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    expected: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    actual: any;
  }[];
}

export interface DriftDetector {
  detectDrift(resourceId: string): Promise<DriftReport>;
}
