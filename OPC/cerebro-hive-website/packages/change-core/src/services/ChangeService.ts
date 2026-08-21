import { ChangeRequest } from '../domain/ChangeRequest';
import { ChangeState } from '../domain/ChangeState';
import { RiskEvaluator } from './RiskEvaluator';
import { ApprovalEngine } from './ApprovalEngine';
import { ApprovalStatus } from '../domain/Approval';
import { ResilienceProvider } from '../integrations/ResilienceProvider';
import { ChangeEventType, ChangeEvent } from '../events/ChangeEvents';

export class ChangeService {
  private events: ChangeEvent[] = [];

  constructor(
    private readonly riskEvaluator: RiskEvaluator,
    private readonly approvalEngine: ApprovalEngine,
    private readonly resilienceProvider: ResilienceProvider
  ) {}

  private emitEvent(eventType: ChangeEventType, change: ChangeRequest, payload: unknown = {}) {
    this.events.push({
      eventId: `evt-${Date.now()}`,
      eventType,
      changeRequestId: change.id,
      timestamp: new Date(),
      payload
    });
    console.log(`[Event] ${eventType} for Change ${change.id}`);
  }

  async submitChange(change: ChangeRequest): Promise<void> {
    if (change.state !== ChangeState.Draft) throw new Error('Only Draft changes can be submitted.');
    change.state = ChangeState.Submitted;
    this.emitEvent(ChangeEventType.ChangeSubmitted, change);
  }

  async assessImpactAndRisk(change: ChangeRequest): Promise<void> {
    if (change.state !== ChangeState.Submitted) throw new Error('Change must be Submitted.');
    
    // Impact analysis (via asset-core, abstracted for now)
    change.state = ChangeState.ImpactAssessed;
    this.emitEvent(ChangeEventType.ImpactAnalysisCompleted, change, { affectedCIs: change.affectedConfigurationItems });

    // Risk Assessment
    const riskScore = await this.riskEvaluator.calculateRisk(change);
    change.calculatedRiskScore = riskScore;
    change.state = ChangeState.RiskAssessed;
    this.emitEvent(ChangeEventType.RiskAssessmentCompleted, change, { riskScore });
    
    // Resilience Validation
    const resilience = await this.resilienceProvider.validateRecoveryObjectives(change.affectedConfigurationItems);
    if (resilience.violatesRTO) {
      throw new Error(`Resilience Validation Failed: ${resilience.message}`);
    }
  }

  async requestApprovals(change: ChangeRequest): Promise<void> {
    if (change.state !== ChangeState.RiskAssessed) throw new Error('Change must be Risk Assessed.');
    
    const approvals = await this.approvalEngine.evaluateApprovals(change);
    change.approvals = approvals;
    
    const allApproved = approvals.every(a => a.status === ApprovalStatus.Approved);
    
    if (allApproved) {
      change.state = ChangeState.Approved;
      this.emitEvent(ChangeEventType.ApprovalGranted, change);
    } else {
      change.state = ChangeState.AwaitingApproval;
      this.emitEvent(ChangeEventType.ApprovalRequested, change, { pendingApprovals: approvals });
    }
  }

  async scheduleDeployment(change: ChangeRequest): Promise<void> {
    if (change.state !== ChangeState.Approved) throw new Error('Change must be Approved.');
    change.state = ChangeState.Scheduled;
    this.emitEvent(ChangeEventType.DeploymentScheduled, change);
  }

  async startDeployment(change: ChangeRequest): Promise<void> {
    if (change.state !== ChangeState.Scheduled) throw new Error('Change must be Scheduled.');
    change.state = ChangeState.Executing;
    this.emitEvent(ChangeEventType.DeploymentStarted, change);
  }

  async completeDeployment(change: ChangeRequest, success: boolean): Promise<void> {
    if (change.state !== ChangeState.Executing) throw new Error('Change must be Executing.');
    if (success) {
      change.state = ChangeState.Verification;
      this.emitEvent(ChangeEventType.DeploymentSucceeded, change);
    } else {
      change.state = ChangeState.RolledBack;
      this.emitEvent(ChangeEventType.DeploymentFailed, change);
    }
  }

  async closeChange(change: ChangeRequest): Promise<void> {
    if (change.state !== ChangeState.Verification) throw new Error('Change must be in Verification to be closed.');
    change.state = ChangeState.Completed;
    this.emitEvent(ChangeEventType.VerificationCompleted, change);
    this.emitEvent(ChangeEventType.ChangeClosed, change);
  }
}
