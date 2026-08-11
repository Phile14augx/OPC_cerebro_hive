import { ChangeRequest } from '../domain/ChangeRequest';
import { Approval, ApprovalStatus, ApprovalType } from '../domain/Approval';
import { PolicyProvider } from '../integrations/PolicyProvider';
import { ChangeCategory } from '../domain/ChangeState';

export class ApprovalEngine {
  constructor(private readonly policyProvider: PolicyProvider) {}

  async evaluateApprovals(change: ChangeRequest): Promise<Approval[]> {
    if (change.calculatedRiskScore === undefined) {
      throw new Error('Risk score must be calculated before evaluating approvals.');
    }

    const isEmergency = change.category === ChangeCategory.Emergency;
    const policyDecision = await this.policyProvider.evaluateChangePolicy(change.calculatedRiskScore, isEmergency);

    if (!policyDecision.allowed) {
      throw new Error(`Change rejected by policy: ${policyDecision.reason}`);
    }

    return policyDecision.requiredApprovals.map((approvalType, index) => ({
      approvalId: `app-${change.id}-${index}`,
      changeRequestId: change.id,
      approvalType,
      status: approvalType === ApprovalType.AutoApproval ? ApprovalStatus.Approved : ApprovalStatus.Pending,
      decidedAt: approvalType === ApprovalType.AutoApproval ? new Date() : undefined
    }));
  }
}
