import { ApprovalEngine, AccessRequest } from '../requests/ApprovalEngine';
import { Entitlement } from './Entitlement';

export class JITProvisioner {
  constructor(private approvalEngine: ApprovalEngine) {}

  /**
   * Provisions a temporary entitlement after approval.
   */
  async provision(requestId: string): Promise<void> {
    const request = this.approvalEngine.getRequest(requestId);
    if (!request) throw new Error('Request not found');
    
    if (request.status !== 'Approved') {
      throw new Error(`Cannot provision request in state: ${request.status}`);
    }

    // 1. Calculate Expiration
    if (request.durationSeconds) {
      request.expiresAt = new Date(Date.now() + request.durationSeconds * 1000);
    }

    // 2. Mark Provisioned
    request.status = 'Provisioned';
    request.decisionHistory.push({
      timestamp: new Date(),
      actorId: 'system',
      action: 'Provisioned',
      comment: request.expiresAt ? `Expires at ${request.expiresAt.toISOString()}` : 'Permanent'
    });

    // 3. (In reality, this would call Identity OS to append the Delegation or Roles)
    console.log(`[JIT] Provisioned Entitlement ${request.entitlementId} for Principal ${request.requesterId}`);
  }

  /**
   * Background task to revoke expired JIT access.
   */
  async revokeExpired(): Promise<void> {
    // In reality, sweeps the active requests and revokes those past `expiresAt`
  }
}
