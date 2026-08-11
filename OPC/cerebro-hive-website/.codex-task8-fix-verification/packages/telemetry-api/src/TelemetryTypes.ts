
export interface PlatformHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptimePercentage: number;
  lastIncidentMs: number;
}

export interface QueueMetrics {
  activeJobs: number;
  pendingJobs: number;
  failedJobs: number;
  averageLatencyMs: number;
}
