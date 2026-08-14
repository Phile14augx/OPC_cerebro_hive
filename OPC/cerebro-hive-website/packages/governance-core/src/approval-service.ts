// ============================================================
// governance-core/src/approval-service.ts
// ============================================================

import { ApprovalRequest, ApprovalStatus, RiskLevel } from "./types";

function generateRequestId(): string {
  return `apr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface ApprovalFilters {
  agentId?: string;
  instanceId?: string;
  missionId?: string;
  taskId?: string;
  status?: ApprovalStatus;
  tenantId?: string;
  riskLevel?: RiskLevel;
  from?: string;
  to?: string;
}

export class ApprovalService {
  static readonly DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  private requests: Map<string, ApprovalRequest> = new Map();

  /**
   * Submit a new approval request. Returns the created request with generated
   * requestId, requestedAt, and initial status of "pending".
   */
  requestApproval(
    req: Omit<ApprovalRequest, "requestId" | "requestedAt" | "status">
  ): ApprovalRequest {
    const now = new Date();
    const requestId = generateRequestId();

    const expiresAt =
      req.expiresAt ??
      new Date(now.getTime() + ApprovalService.DEFAULT_EXPIRY_MS).toISOString();

    const approval: ApprovalRequest = {
      ...req,
      requestId,
      requestedAt: now.toISOString(),
      expiresAt,
      status: "pending",
    };

    this.requests.set(requestId, approval);
    return { ...approval };
  }

  /**
   * Approve a pending request.
   */
  approve(
    requestId: string,
    approvedBy: string,
    notes?: string
  ): ApprovalRequest {
    const req = this.getOrThrow(requestId);

    if (req.status === "expired") {
      throw new Error(`Approval request ${requestId} has already expired.`);
    }
    if (req.status !== "pending" && req.status !== "delegated") {
      throw new Error(
        `Cannot approve request in status "${req.status}". Must be "pending" or "delegated".`
      );
    }

    // Automatically check expiry before approving
    this.checkExpired();
    const fresh = this.requests.get(requestId);
    if (!fresh || fresh.status === "expired") {
      throw new Error(`Approval request ${requestId} has expired.`);
    }

    const updated: ApprovalRequest = {
      ...fresh,
      status: "approved",
      approvedBy,
      approvedAt: new Date().toISOString(),
      notes: notes ?? fresh.notes,
    };

    this.requests.set(requestId, updated);
    return { ...updated };
  }

  /**
   * Reject a pending request.
   */
  reject(
    requestId: string,
    rejectedBy: string,
    reason: string
  ): ApprovalRequest {
    const req = this.getOrThrow(requestId);

    if (req.status === "expired") {
      throw new Error(`Approval request ${requestId} has already expired.`);
    }
    if (req.status === "approved") {
      throw new Error(`Cannot reject an already-approved request.`);
    }
    if (req.status === "rejected") {
      throw new Error(`Request ${requestId} has already been rejected.`);
    }

    const updated: ApprovalRequest = {
      ...req,
      status: "rejected",
      rejectedBy,
      rejectedReason: reason,
    };

    this.requests.set(requestId, updated);
    return { ...updated };
  }

  /**
   * Delegate a pending approval to another approver.
   */
  delegate(requestId: string, delegateTo: string): ApprovalRequest {
    const req = this.getOrThrow(requestId);

    if (req.status !== "pending") {
      throw new Error(
        `Can only delegate pending requests, current status: "${req.status}"`
      );
    }

    const updated: ApprovalRequest = {
      ...req,
      status: "delegated",
      delegatedTo: delegateTo,
    };

    this.requests.set(requestId, updated);
    return { ...updated };
  }

  /**
   * Add a clarification question to a pending request.
   * The requester (agent) should answer before the request can be approved.
   */
  requestClarification(
    requestId: string,
    question: string
  ): ApprovalRequest {
    const req = this.getOrThrow(requestId);

    if (req.status !== "pending" && req.status !== "delegated") {
      throw new Error(
        `Cannot request clarification on a request in status "${req.status}"`
      );
    }

    const updated: ApprovalRequest = {
      ...req,
      clarificationRequest: question,
    };

    this.requests.set(requestId, updated);
    return { ...updated };
  }

  getRequest(requestId: string): ApprovalRequest {
    return { ...this.getOrThrow(requestId) };
  }

  /**
   * Return all requests that are currently in "pending" or "delegated" status
   * and have not expired. Optionally filter by tenantId.
   */
  listPending(tenantId?: string): ApprovalRequest[] {
    this.checkExpired();

    return Array.from(this.requests.values())
      .filter((r) => {
        const statusOk =
          r.status === "pending" || r.status === "delegated";
        const tenantOk = tenantId ? r.agentId.startsWith(tenantId) : true;
        return statusOk && tenantOk;
      })
      .map((r) => ({ ...r }));
  }

  /**
   * Return all requests, optionally filtered.
   */
  listAll(filters?: ApprovalFilters): ApprovalRequest[] {
    let results = Array.from(this.requests.values());

    if (!filters) return results.map((r) => ({ ...r }));

    if (filters.agentId !== undefined) {
      results = results.filter((r) => r.agentId === filters.agentId);
    }
    if (filters.instanceId !== undefined) {
      results = results.filter((r) => r.instanceId === filters.instanceId);
    }
    if (filters.missionId !== undefined) {
      results = results.filter((r) => r.missionId === filters.missionId);
    }
    if (filters.taskId !== undefined) {
      results = results.filter((r) => r.taskId === filters.taskId);
    }
    if (filters.status !== undefined) {
      results = results.filter((r) => r.status === filters.status);
    }
    if (filters.riskLevel !== undefined) {
      results = results.filter((r) => r.riskLevel === filters.riskLevel);
    }
    if (filters.from !== undefined) {
      const from = new Date(filters.from).getTime();
      results = results.filter(
        (r) => new Date(r.requestedAt).getTime() >= from
      );
    }
    if (filters.to !== undefined) {
      const to = new Date(filters.to).getTime();
      results = results.filter(
        (r) => new Date(r.requestedAt).getTime() <= to
      );
    }

    return results.map((r) => ({ ...r }));
  }

  /**
   * Scan all pending/delegated requests, mark expired ones, and return them.
   */
  checkExpired(): ApprovalRequest[] {
    const now = new Date();
    const expired: ApprovalRequest[] = [];

    for (const req of this.requests.values()) {
      if (req.status !== "pending" && req.status !== "delegated") continue;
      if (new Date(req.expiresAt) <= now) {
        const updated: ApprovalRequest = { ...req, status: "expired" };
        this.requests.set(req.requestId, updated);
        expired.push({ ...updated });
      }
    }

    return expired;
  }

  private getOrThrow(requestId: string): ApprovalRequest {
    const req = this.requests.get(requestId);
    if (!req) throw new Error(`Approval request not found: ${requestId}`);
    return req;
  }
}
