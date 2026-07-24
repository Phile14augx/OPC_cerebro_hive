import { ApprovalType } from '../domain/Approval';

export interface PolicyDecision {
  allowed: boolean;
  requiredApprovals: ApprovalType[];
  reason: string;
}

export interface PolicyProvider {
  evaluateChangePolicy(riskScore: number, isEmergency: boolean): Promise<PolicyDecision>;
}

export class MockPolicyProvider implements PolicyProvider {
  async evaluateChangePolicy(riskScore: number, isEmergency: boolean): Promise<PolicyDecision> {
    if (isEmergency) {
      return { allowed: true, requiredApprovals: [ApprovalType.EmergencyCAB], reason: 'Emergency protocol engaged' };
    }
    
    if (riskScore < 20) {
      return { allowed: true, requiredApprovals: [ApprovalType.AutoApproval], reason: 'Low risk change' };
    }
    
    if (riskScore < 50) {
      return { allowed: true, requiredApprovals: [ApprovalType.Manager], reason: 'Medium risk change requires manager' };
    }
    
    return { allowed: true, requiredApprovals: [ApprovalType.CAB], reason: 'High risk change requires CAB' };
  }
}
