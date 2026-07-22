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
    expected: any;
    actual: any;
  }[];
}

export interface DriftDetector {
  detectDrift(resourceId: string): Promise<DriftReport>;
}
