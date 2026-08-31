import { resolveIdentity } from './identity.js';
import type { ReasonCode } from './types.js';

export interface Lease {
  resource_id: string;
  live_epoch: number;
  live_control_sha256: string;
  owner_agent_id: string;
  run_id: string;
  issued_at: string;
  renewed_at: string;
  expires_at: string;
  fencing_token: number;
  process_liveness: number;
  previous_lease_digest: string;
}

export interface EnforceLeaseRequest {
  current_lease: Lease | null;
  proposed_lease: Lease;
  current_time: string;
  live_epoch: number;
  live_control_sha256: string;
}

export function enforceLease(req: EnforceLeaseRequest): { valid: boolean; finding?: { code: ReasonCode; message: string } } {
  // Validate identity mathematically (schema logic via resolveIdentity throws if invalid)
  try {
    resolveIdentity(req.proposed_lease.owner_agent_id);
  } catch (e: unknown) {
    return {
      valid: false,
      finding: {
        code: 'OWNER_MISSING',
        message: e instanceof Error ? e.message : String(e)
      }
    };
  }

  // Bind to live epoch / hash
  if (req.proposed_lease.live_epoch !== req.live_epoch || req.proposed_lease.live_control_sha256 !== req.live_control_sha256) {
    return {
      valid: false,
      finding: {
        code: 'CONTROL_CHANGED',
        message: 'Lease epoch or hash does not match current live authority.'
      }
    };
  }

  const currentTimeMs = new Date(req.current_time).getTime();
  const proposedExpiresMs = new Date(req.proposed_lease.expires_at).getTime();

  // If the proposed lease itself is already expired, reject it.
  if (currentTimeMs >= proposedExpiresMs) {
    return {
      valid: false,
      finding: {
        code: 'LEASE_EXPIRED',
        message: 'Proposed lease is already expired.'
      }
    };
  }

  // If there's no current lease, we can just acquire it
  if (!req.current_lease) {
    return { valid: true };
  }

  // Resource mismatch check
  if (req.current_lease.resource_id !== req.proposed_lease.resource_id) {
    return {
      valid: false,
      finding: {
        code: 'SCOPE_OVERLAP',
        message: 'Proposed lease targets a different resource ID.'
      }
    };
  }

  const currentExpiresMs = new Date(req.current_lease.expires_at).getTime();
  const isCurrentExpired = currentTimeMs >= currentExpiresMs;

  // Stale Token (Token downgrades)
  if (req.proposed_lease.fencing_token <= req.current_lease.fencing_token) {
    return {
      valid: false,
      finding: {
        code: 'FENCING_TOKEN_STALE',
        message: 'Proposed fencing token must be strictly greater than the current token.'
      }
    };
  }

  if (!isCurrentExpired) {
    // If the lease is active, check owner mismatch
    if (req.current_lease.owner_agent_id !== req.proposed_lease.owner_agent_id) {
      return {
        valid: false,
        finding: {
          code: 'MULTIPLE_WRITERS',
          message: 'Active lease is held by another owner.'
        }
      };
    }
  }

  return { valid: true };
}
