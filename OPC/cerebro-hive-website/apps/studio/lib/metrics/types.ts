export interface EngineeringHealthMetrics {
  openIssues: number;
  openPullRequests: number;
  criticalBugs: number;
  deploymentStatus: "healthy" | "degraded" | "failing";
}

export interface SprintProgress {
  totalStoryPoints: number;
  completedStoryPoints: number;
  completionPercentage: number;
  daysRemaining: number;
}

export interface MetricsProvider {
  getEngineeringHealth(): Promise<EngineeringHealthMetrics>;
  getCurrentSprintProgress(): Promise<SprintProgress>;
}
