
import type { EngineeringReviewReport } from '../orchestrator/EngineeringReviewOrchestrator';

/**
 * Owns multiple immutable reports across the lifecycle of a review.
 * The session is the conversation; reports are the immutable snapshots.
 * 
 *  Review #1  →  Workflow updated  →  Review #2  →  Approved
 */
export class EngineeringReviewSession {
  private reports: EngineeringReviewReport[] = [];
  public readonly createdAt = new Date();

  constructor(
    public readonly sessionId: string,
    public readonly workspaceId: string,
    public readonly tenantId: string,
  ) {}

  get reportCount() { return this.reports.length; }
  get latestReport() { return this.reports[this.reports.length - 1] ?? null; }
  get allReports()   { return [...this.reports]; } // immutable copy

  addReport(report: EngineeringReviewReport) {
    Object.freeze(report); // Enforce immutability
    this.reports.push(report);
  }

  isApproved(): boolean {
    return this.latestReport?.overallVerdict === 'PASS' &&
      (this.latestReport.requiredApprovals.length === 0);
  }
}
