import { MetricsProvider, EngineeringHealthMetrics, SprintProgress } from "./types";
import { Octokit } from "@octokit/rest";

export class GitHubMetricsProvider implements MetricsProvider {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(owner: string, repo: string) {
    this.octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    this.owner = owner;
    this.repo = repo;
  }

  async getEngineeringHealth(): Promise<EngineeringHealthMetrics> {
    // In a real implementation, we would fetch actual issues/PRs.
    // For V1, we simulate fetching this data.
    return {
      openIssues: 12,
      openPullRequests: 4,
      criticalBugs: 0,
      deploymentStatus: "healthy",
    };
  }

  async getCurrentSprintProgress(): Promise<SprintProgress> {
    // In a real implementation, we would fetch the current milestone and sum story points.
    return {
      totalStoryPoints: 42,
      completedStoryPoints: 28,
      completionPercentage: Math.round((28 / 42) * 100),
      daysRemaining: 4,
    };
  }
}
