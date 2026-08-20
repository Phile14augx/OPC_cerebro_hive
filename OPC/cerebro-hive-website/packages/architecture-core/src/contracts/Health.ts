export type HealthState = 'Healthy' | 'Degraded' | 'Offline' | 'Initializing' | 'Unknown';

export interface HealthStatus {
  state: HealthState;
  dependencies: Record<string, HealthState>;
  lastHeartbeat: Date;
  details?: Record<string, unknown>;
}

export interface HealthContract {
  getHealth(): Promise<HealthStatus>;
  checkLiveness(): boolean;
  checkReadiness(): boolean;
}
