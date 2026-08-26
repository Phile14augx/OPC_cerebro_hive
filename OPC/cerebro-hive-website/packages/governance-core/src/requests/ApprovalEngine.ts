import { Entitlement } from '../entitlements/Entitlement';
import { SoDValidator } from './SoDValidator';


export type RequestStatus = 'Pending' | 'Approved' | 'Denied' | 'Provisioned' | 'Expired' | 'Revoked';

export interface AccessRequest {
  id: string;
  requesterId: string;
  entitlementId: string;
  businessJustification: string;
  durationSeconds?: number;
  status: RequestStatus;
  
  // Audit Trail
  approverIds: string[];
  decisionHistory: Array<{ timestamp: Date; actorId: string; action: string; comment?: string }>;
  
  expiresAt?: Date;
}

export class ApprovalEngine {
  private requests = new Map<string, AccessRequest>();
  
  constructor(private sodValidator: SoDValidator) {}

  /**
   * Submits a new access request, evaluating SoD first.
   */
  async submitRequest(
    requesterId: string, 
    entitlement: Entitlement, 
    currentEntitlements: string[], 
    justification: string,
    durationSeconds?: number
  ): Promise<AccessRequest> {
    
    // 1. SoD Check
    const sodCheck = this.sodValidator.validate(currentEntitlements, entitlement.id);
    if (!sodCheck.valid) {
      throw new Error(`Access Denied due to SoD violations: ${sodCheck.violations.join(', ')}`);
    }

    const request: AccessRequest = {
      id: `req-${Date.now()}`,
      requesterId,
      entitlementId: entitlement.id,
      businessJustification: justification,
      durationSeconds: durationSeconds || entitlement.maxDurationSeconds,
      status: entitlement.requiresApproval ? 'Pending' : 'Approved',
      approverIds: [],
      decisionHistory: [{
        timestamp: new Date(),
        actorId: requesterId,
        action: 'Submitted',
        comment: justification
      }]
    };

    this.requests.set(request.id, request);
    return request;
  }

  /**
   * Approves a pending request.
   */
  async approveRequest(requestId: string, approverId: string, comment?: string): Promise<AccessRequest> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');
    if (request.status !== 'Pending') throw new Error(`Cannot approve request in status: ${request.status}`);

    request.status = 'Approved';
    request.approverIds.push(approverId);
    request.decisionHistory.push({
      timestamp: new Date(),
      actorId: approverId,
      action: 'Approved',
      comment
    });

    return request;
  }
  
  getRequest(id: string): AccessRequest | undefined {
    return this.requests.get(id);
  }
}
