import { describe, expect, it } from 'vitest';
import { enforceLease, Lease } from '../../src/lease.js';

describe('Lease Enforcement (Positive)', () => {
  const baseLease: Lease = {
    resource_id: 'worktree/w3.05',
    live_epoch: 40,
    live_control_sha256: 'abc',
    owner_agent_id: 'CODEX_B1',
    run_id: 'run-1',
    issued_at: '2026-08-30T10:00:00.000Z',
    renewed_at: '2026-08-30T10:00:00.000Z',
    expires_at: '2026-08-30T10:05:00.000Z',
    fencing_token: 2,
    process_liveness: 1234,
    previous_lease_digest: 'digest-1'
  };

  it('allows valid initial lease acquisition', () => {
    const res = enforceLease({
      current_lease: null,
      proposed_lease: baseLease,
      current_time: '2026-08-30T10:01:00.000Z',
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(true);
    expect(res.finding).toBeUndefined();
  });

  it('allows valid lease renewal with incremented token', () => {
    const currentLease = { ...baseLease, fencing_token: 2, expires_at: '2026-08-30T10:05:00.000Z' };
    const proposedLease = { ...baseLease, fencing_token: 3, expires_at: '2026-08-30T10:10:00.000Z' };
    const res = enforceLease({
      current_lease: currentLease,
      proposed_lease: proposedLease,
      current_time: '2026-08-30T10:04:00.000Z',
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(true);
    expect(res.finding).toBeUndefined();
  });

  it('allows another agent to take over an expired lease', () => {
    const currentLease = { ...baseLease, expires_at: '2026-08-30T10:05:00.000Z', fencing_token: 2 };
    const proposedLease = { ...baseLease, owner_agent_id: 'CODEX_B2', fencing_token: 3, expires_at: '2026-08-30T10:10:00.000Z' };
    const res = enforceLease({
      current_lease: currentLease,
      proposed_lease: proposedLease,
      current_time: '2026-08-30T10:06:00.000Z', // currently expired
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(true);
    expect(res.finding).toBeUndefined();
  });
});
