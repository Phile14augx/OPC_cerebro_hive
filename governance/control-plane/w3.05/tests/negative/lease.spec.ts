import { describe, expect, it } from 'vitest';
import { enforceLease, Lease } from '../../src/lease.js';

describe('Lease Enforcement (Negative)', () => {
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

  it('rejects stale leases (expired)', () => {
    const res = enforceLease({
      current_lease: null,
      proposed_lease: baseLease,
      current_time: '2026-08-30T10:06:00.000Z',
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(false);
    expect(res.finding?.code).toBe('LEASE_EXPIRED');
  });

  it('rejects mismatched owners when current lease is active', () => {
    const currentLease = { ...baseLease, expires_at: '2026-08-30T10:06:00.000Z' };
    const proposedLease = { ...baseLease, owner_agent_id: 'CODEX_B2', fencing_token: 3 };
    const res = enforceLease({
      current_lease: currentLease,
      proposed_lease: proposedLease,
      current_time: '2026-08-30T10:04:00.000Z',
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(false);
    expect(res.finding?.code).toBe('MULTIPLE_WRITERS');
  });

  it('rejects token downgrades on renewal', () => {
    const currentLease = { ...baseLease, expires_at: '2026-08-30T10:06:00.000Z', fencing_token: 5 };
    const proposedLease = { ...baseLease, fencing_token: 4 };
    const res = enforceLease({
      current_lease: currentLease,
      proposed_lease: proposedLease,
      current_time: '2026-08-30T10:04:00.000Z',
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(false);
    expect(res.finding?.code).toBe('FENCING_TOKEN_STALE');
  });

  it('rejects identity parse error', () => {
    const res = enforceLease({
      current_lease: null,
      proposed_lease: { ...baseLease, owner_agent_id: 'INVALID_ID' },
      current_time: '2026-08-30T10:04:00.000Z',
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(false);
    expect(res.finding?.code).toBe('OWNER_MISSING'); 
  });

  it('rejects live epoch mismatch', () => {
    const res = enforceLease({
      current_lease: null,
      proposed_lease: { ...baseLease, live_epoch: 39 },
      current_time: '2026-08-30T10:04:00.000Z',
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(false);
    expect(res.finding?.code).toBe('CONTROL_CHANGED');
  });
  
  it('rejects live hash mismatch', () => {
    const res = enforceLease({
      current_lease: null,
      proposed_lease: { ...baseLease, live_control_sha256: 'old-hash' },
      current_time: '2026-08-30T10:04:00.000Z',
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(false);
    expect(res.finding?.code).toBe('CONTROL_CHANGED');
  });

  it('rejects resource mismatch', () => {
    const currentLease = { ...baseLease, expires_at: '2026-08-30T10:06:00.000Z' };
    const proposedLease = { ...baseLease, resource_id: 'worktree/w3.06', fencing_token: 3 };
    const res = enforceLease({
      current_lease: currentLease,
      proposed_lease: proposedLease,
      current_time: '2026-08-30T10:04:00.000Z',
      live_epoch: 40,
      live_control_sha256: 'abc'
    });
    expect(res.valid).toBe(false);
    expect(res.finding?.code).toBe('SCOPE_OVERLAP');
  });
});
