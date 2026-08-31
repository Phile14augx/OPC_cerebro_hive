/**
 * W3.05 Invariant Engine — Negative Test Suite (Task 8)
 *
 * For each of the 28 invariants: one invalid ValidationContext that produces
 * exactly one Finding with the correct invariant_id, reason_code, severity,
 * and non-empty evidence_refs.
 *
 * INV-028 extended suite covers: duplicate epoch, lower epoch, skipped epoch,
 * wrong supersedes_epoch (INV-027), wrong previous_control_sha256 (INV-027),
 * and previously published epoch number.
 *
 * Total: 28 primary negative + 4 extended INV-028 + 2 extended INV-027 = 34 cases.
 */
import { describe, expect, it } from 'vitest';
import {
  evaluateInvariants,
  Finding,
  ValidationContext,
} from '../../src/validator/invariants.js';

// ---------------------------------------------------------------------------
// Base clean context (all invariants pass)
// ---------------------------------------------------------------------------

const LIVE_SHA = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

const baseCtx: ValidationContext = {
  authority: {
    epoch: 40,
    supersedes_epoch: 40,
    previous_control_sha256: LIVE_SHA,
    published_epochs: [1, 2, 3, 39, 40],
  },
  ownership: {
    worktree_owners: ['CODEX_B1'],
    builder_id: 'CODEX_B1',
    verifier_id: 'CODEX_V1',
  },
  builder_role: 'PRODUCT_BUILDER',
  dirty_state: { staged: {}, unstaged: {}, untracked: {} },
  lease: {
    fencing_token: 5,
    owner: 'CODEX_B1',
    expiry: '2099-01-01T00:00:00Z',
    current_time: '2026-08-31T00:00:00Z',
    presented_fencing_token: 5,
  },
  head_sha: 'sha-abc',
  expected_head_sha: 'sha-abc',
  filesystem_fingerprint: 'fp-clean',
  expected_fingerprint: 'fp-clean',
  git_locks: [],
  attestation: {
    attested_commit_sha: 'deadbeef' + '0'.repeat(32),
    attested_repository: 'owner/repo',
    all_required_checks_passed: true,
    approved_ref_reachable: true,
    evidence_captured_at: '2026-08-31T12:00:00Z',
    freshness_deadline: '2026-08-31T11:00:00Z',
  },
  attestation_required: false,
  proposal_epoch: 41,
  shared_infra_resources: [
    { resource_id: 'lockfile', owner: 'SHARED_INFRA_B1', has_active_lease: true },
  ],
  handoff: null,
  scope: {
    allowed_paths: ['src/products/p10'],
    touched_paths: ['src/products/p10/index.ts'],
    recovery_paths: ['src/recovery/f16'],
    product_paths: ['src/products/p10'],
    scope_declared: true,
  },
  historical_epochs: [
    { epoch_number: 39, sha256: 'historical-sha-39' },
    { epoch_number: 38, sha256: 'historical-sha-38' },
  ],
  historical_epoch_sha256_at_capture: {
    39: 'historical-sha-39',
    38: 'historical-sha-38',
  },
  is_proposal_context: false,
  is_publication_context: false,
  expected_live_sha256: LIVE_SHA,
  actual_live_sha256: LIVE_SHA,
  live_yaml_valid: true,
  manifest_authority_coherent: true,
  output_is_deterministic: true,
  secrets_redacted: true,
  is_resume_or_retry: false,
  resume_revalidated: false,
  is_post_abort: false,
  state_unchanged_after_abort: true,
  publication_evidence_complete: true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findingFor(ctx: ValidationContext, id: string): Finding {
  const findings = evaluateInvariants(ctx);
  const relevant = findings.filter((f) => f.invariant_id === id);
  expect(
    relevant,
    `${id}: expected exactly 1 finding but got ${relevant.length}: ${JSON.stringify(findings)}`,
  ).toHaveLength(1);
  return relevant[0] as Finding;
}

function assertFinding(
  f: Finding,
  id: string,
  reason_code: string,
  severity: string,
): void {
  expect(f.invariant_id).toBe(id);
  expect(f.reason_code).toBe(reason_code);
  expect(f.severity).toBe(severity);
  expect(f.evidence_refs.length).toBeGreaterThan(0);
  expect(f.message.length).toBeGreaterThan(0);
}

// ---------------------------------------------------------------------------
// Negative tests
// ---------------------------------------------------------------------------

describe('Invariant Engine — Negative Suite', () => {

  // INV-001
  it('INV-001: two write owners => MULTIPLE_WRITERS', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      ownership: { ...baseCtx.ownership, worktree_owners: ['CODEX_B1', 'CODEX_B2'] },
    };
    const f = findingFor(ctx, 'INV-001');
    assertFinding(f, 'INV-001', 'MULTIPLE_WRITERS', 'CRITICAL');
  });

  it('INV-001: zero write owners => MULTIPLE_WRITERS', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      ownership: { ...baseCtx.ownership, worktree_owners: [] },
    };
    const f = findingFor(ctx, 'INV-001');
    assertFinding(f, 'INV-001', 'MULTIPLE_WRITERS', 'CRITICAL');
  });

  // INV-002
  it('INV-002: builder_id == verifier_id => BUILDER_VERIFIER_COLLISION', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      ownership: { ...baseCtx.ownership, verifier_id: 'CODEX_B1' },
    };
    const f = findingFor(ctx, 'INV-002');
    assertFinding(f, 'INV-002', 'BUILDER_VERIFIER_COLLISION', 'CRITICAL');
  });

  // INV-003
  it('INV-003: scope not declared => SCOPE_MISSING', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      scope: { ...baseCtx.scope, scope_declared: false },
    };
    const f = findingFor(ctx, 'INV-003');
    assertFinding(f, 'INV-003', 'SCOPE_MISSING', 'CRITICAL');
  });

  it('INV-003: touched path outside allowed => PATH_SCOPE_ESCAPE', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      scope: {
        ...baseCtx.scope,
        allowed_paths: ['src/products/p10'],
        touched_paths: ['src/products/p10/index.ts', 'src/products/p11/hack.ts'],
        scope_declared: true,
      },
    };
    const f = findingFor(ctx, 'INV-003');
    assertFinding(f, 'INV-003', 'PATH_SCOPE_ESCAPE', 'CRITICAL');
  });

  // INV-004
  it('INV-004: product builder touches recovery path => SCOPE_OVERLAP', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      builder_role: 'PRODUCT_BUILDER',
      scope: {
        ...baseCtx.scope,
        allowed_paths: ['src/products/p10', 'src/recovery/f16'],
        touched_paths: ['src/recovery/f16/fix.ts'],
      },
    };
    const f = findingFor(ctx, 'INV-004');
    assertFinding(f, 'INV-004', 'SCOPE_OVERLAP', 'CRITICAL');
  });

  // INV-005
  it('INV-005: recovery builder touches product path => SCOPE_OVERLAP', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      builder_role: 'RECOVERY_BUILDER',
      scope: {
        ...baseCtx.scope,
        allowed_paths: ['src/recovery/f16', 'src/products/p10'],
        touched_paths: ['src/products/p10/index.ts'],
        product_paths: ['src/products/p10'],
      },
    };
    const f = findingFor(ctx, 'INV-005');
    assertFinding(f, 'INV-005', 'SCOPE_OVERLAP', 'CRITICAL');
  });

  // INV-006
  it('INV-006: shared infra resource has no owner => SHARED_INFRA_UNOWNED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      shared_infra_resources: [
        { resource_id: 'lockfile', owner: null, has_active_lease: false },
      ],
    };
    const f = findingFor(ctx, 'INV-006');
    assertFinding(f, 'INV-006', 'SHARED_INFRA_UNOWNED', 'HIGH');
  });

  it('INV-006: shared infra resource has owner but no lease => SHARED_INFRA_UNOWNED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      shared_infra_resources: [
        { resource_id: 'lockfile', owner: 'SHARED_INFRA_B1', has_active_lease: false },
      ],
    };
    const f = findingFor(ctx, 'INV-006');
    assertFinding(f, 'INV-006', 'SHARED_INFRA_UNOWNED', 'HIGH');
  });

  // INV-007
  it('INV-007: staged file unreconciled => DIRTY_UNRECONCILED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      dirty_state: {
        staged: { 'src/products/p10/mod.ts': 'UNRESOLVED' },
        unstaged: {},
        untracked: {},
      },
    };
    const f = findingFor(ctx, 'INV-007');
    assertFinding(f, 'INV-007', 'DIRTY_UNRECONCILED', 'CRITICAL');
  });

  // INV-008
  it('INV-008: HEAD moved => HEAD_CHANGED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      head_sha: 'sha-xyz-new',
    };
    const f = findingFor(ctx, 'INV-008');
    assertFinding(f, 'INV-008', 'HEAD_CHANGED', 'CRITICAL');
  });

  // INV-009
  it('INV-009: fingerprint drifted => EXTERNAL_MUTATION_DETECTED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      filesystem_fingerprint: 'fp-drifted',
    };
    const f = findingFor(ctx, 'INV-009');
    assertFinding(f, 'INV-009', 'EXTERNAL_MUTATION_DETECTED', 'CRITICAL');
  });

  // INV-010 (verifiable lock => GIT_LOCK_ACTIVE)
  it('INV-010: verifiable git lock present => GIT_LOCK_ACTIVE', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      git_locks: [{ path: '.git/index.lock', verifiable: true }],
    };
    const f = findingFor(ctx, 'INV-010');
    assertFinding(f, 'INV-010', 'GIT_LOCK_ACTIVE', 'CRITICAL');
  });

  // INV-010 (unverifiable lock => GIT_LOCK_UNVERIFIABLE)
  it('INV-010: unverifiable git lock => GIT_LOCK_UNVERIFIABLE', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      git_locks: [{ path: '.git/index.lock', verifiable: false }],
    };
    const f = findingFor(ctx, 'INV-010');
    assertFinding(f, 'INV-010', 'GIT_LOCK_UNVERIFIABLE', 'CRITICAL');
  });

  // INV-011
  it('INV-011: attestation required but absent => REMOTE_ATTESTATION_STALE', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      attestation_required: true,
      attestation: null,
    };
    const f = findingFor(ctx, 'INV-011');
    assertFinding(f, 'INV-011', 'REMOTE_ATTESTATION_STALE', 'CRITICAL');
  });

  it('INV-011: attestation required but checks failed => REMOTE_ATTESTATION_STALE', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      attestation_required: true,
      attestation: {
        ...baseCtx.attestation!,
        all_required_checks_passed: false,
      },
    };
    const f = findingFor(ctx, 'INV-011');
    assertFinding(f, 'INV-011', 'REMOTE_ATTESTATION_STALE', 'CRITICAL');
  });

  it('INV-011: attestation required but stale evidence => REMOTE_ATTESTATION_STALE', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      attestation_required: true,
      attestation: {
        ...baseCtx.attestation!,
        all_required_checks_passed: true,
        approved_ref_reachable: true,
        // evidence_captured_at < freshness_deadline means stale
        evidence_captured_at: '2026-08-31T10:00:00Z',
        freshness_deadline: '2026-08-31T11:00:00Z',
      },
    };
    const f = findingFor(ctx, 'INV-011');
    assertFinding(f, 'INV-011', 'REMOTE_ATTESTATION_STALE', 'CRITICAL');
  });

  // INV-012
  it('INV-012: historical epoch SHA mutated => HISTORICAL_EPOCH_MUTATION', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      historical_epochs: [
        { epoch_number: 39, sha256: 'TAMPERED-sha-39' },
        { epoch_number: 38, sha256: 'historical-sha-38' },
      ],
    };
    const f = findingFor(ctx, 'INV-012');
    assertFinding(f, 'INV-012', 'HISTORICAL_EPOCH_MUTATION', 'CRITICAL');
  });

  // INV-013
  it('INV-013: proposal context with incoherent authority => CONTROL_SCHEMA_INVALID', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_proposal_context: true,
      manifest_authority_coherent: false,
    };
    const f = findingFor(ctx, 'INV-013');
    assertFinding(f, 'INV-013', 'CONTROL_SCHEMA_INVALID', 'HIGH');
  });

  // INV-014
  it('INV-014: CAS publication with hash mismatch => CAS_CONFLICT', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_publication_context: true,
      expected_live_sha256: LIVE_SHA,
      actual_live_sha256: 'different-sha-' + '0'.repeat(50),
    };
    const f = findingFor(ctx, 'INV-014');
    assertFinding(f, 'INV-014', 'CAS_CONFLICT', 'CRITICAL');
  });

  // INV-015
  it('INV-015: CAS hash mismatch => CAS_CONFLICT', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_publication_context: true,
      expected_live_sha256: LIVE_SHA,
      actual_live_sha256: 'wrong-sha-' + '0'.repeat(54),
    };
    const f = findingFor(ctx, 'INV-015');
    assertFinding(f, 'INV-015', 'CAS_CONFLICT', 'CRITICAL');
  });

  // INV-016
  it('INV-016: live YAML invalid => CONTROL_PARSE_INVALID', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      live_yaml_valid: false,
    };
    const f = findingFor(ctx, 'INV-016');
    assertFinding(f, 'INV-016', 'CONTROL_PARSE_INVALID', 'CRITICAL');
  });

  // INV-017 pending
  it('INV-017: HANDOFF_PENDING blocks ownership => HANDOFF_PENDING', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      handoff: {
        status: 'HANDOFF_PENDING',
        to_agent: 'CODEX_B2',
        expiry: '2026-09-01T00:00:00Z',
        current_time: '2026-08-31T00:00:00Z',
      },
    };
    const f = findingFor(ctx, 'INV-017');
    assertFinding(f, 'INV-017', 'HANDOFF_PENDING', 'HIGH');
  });

  // INV-017 expired
  it('INV-017: HANDOFF_EXPIRED blocks ownership => HANDOFF_EXPIRED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      handoff: {
        status: 'HANDOFF_EXPIRED',
        to_agent: 'CODEX_B2',
        expiry: '2026-08-30T00:00:00Z',
        current_time: '2026-08-31T00:00:00Z',
      },
    };
    const f = findingFor(ctx, 'INV-017');
    assertFinding(f, 'INV-017', 'HANDOFF_EXPIRED', 'HIGH');
  });

  // INV-018: empty repository
  it('INV-018: attestation with empty repository => REMOTE_REPOSITORY_MISMATCH', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      attestation: {
        ...baseCtx.attestation!,
        attested_repository: '',
        approved_ref_reachable: true,
      },
    };
    const f = findingFor(ctx, 'INV-018');
    assertFinding(f, 'INV-018', 'REMOTE_REPOSITORY_MISMATCH', 'HIGH');
  });

  // INV-018: unapproved ref
  it('INV-018: commit not reachable from approved ref => REMOTE_REPOSITORY_MISMATCH', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      attestation: {
        ...baseCtx.attestation!,
        attested_repository: 'owner/repo',
        approved_ref_reachable: false,
      },
    };
    const f = findingFor(ctx, 'INV-018');
    assertFinding(f, 'INV-018', 'REMOTE_REPOSITORY_MISMATCH', 'HIGH');
  });

  // INV-019
  it('INV-019: stale fencing token presented => FENCING_TOKEN_STALE', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      lease: {
        ...baseCtx.lease!,
        fencing_token: 5,
        presented_fencing_token: 3,
      },
    };
    const f = findingFor(ctx, 'INV-019');
    assertFinding(f, 'INV-019', 'FENCING_TOKEN_STALE', 'CRITICAL');
  });

  // INV-020
  it('INV-020: manifest authority incoherent => CONTROL_CHANGED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      manifest_authority_coherent: false,
    };
    const f = findingFor(ctx, 'INV-020');
    assertFinding(f, 'INV-020', 'CONTROL_CHANGED', 'HIGH');
  });

  // INV-021
  it('INV-021: post-abort state changed => EXTERNAL_MUTATION_DETECTED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_post_abort: true,
      state_unchanged_after_abort: false,
    };
    const f = findingFor(ctx, 'INV-021');
    assertFinding(f, 'INV-021', 'EXTERNAL_MUTATION_DETECTED', 'HIGH');
  });

  // INV-022
  it('INV-022: non-deterministic output => NONDETERMINISTIC_OUTPUT', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      output_is_deterministic: false,
    };
    const f = findingFor(ctx, 'INV-022');
    assertFinding(f, 'INV-022', 'NONDETERMINISTIC_OUTPUT', 'HIGH');
  });

  // INV-023
  it('INV-023: secrets not redacted => SECRET_REDACTION_FAILED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      secrets_redacted: false,
    };
    const f = findingFor(ctx, 'INV-023');
    assertFinding(f, 'INV-023', 'SECRET_REDACTION_FAILED', 'CRITICAL');
  });

  // INV-024
  it('INV-024: resume without re-validation => CONTROL_CHANGED', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_resume_or_retry: true,
      resume_revalidated: false,
    };
    const f = findingFor(ctx, 'INV-024');
    assertFinding(f, 'INV-024', 'CONTROL_CHANGED', 'HIGH');
  });

  // INV-025
  it('INV-025: publication with incomplete evidence => REMOTE_ATTESTATION_STALE', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_publication_context: true,
      publication_evidence_complete: false,
      expected_live_sha256: LIVE_SHA,
      actual_live_sha256: LIVE_SHA,
    };
    const f = findingFor(ctx, 'INV-025');
    assertFinding(f, 'INV-025', 'REMOTE_ATTESTATION_STALE', 'CRITICAL');
  });

  // INV-026: proposal not successor
  it('INV-026: proposal_epoch != live + 1 => EPOCH_NOT_MONOTONIC', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      proposal_epoch: 43, // should be 41
    };
    const f = findingFor(ctx, 'INV-026');
    assertFinding(f, 'INV-026', 'EPOCH_NOT_MONOTONIC', 'CRITICAL');
  });

  // INV-027: wrong supersedes_epoch
  it('INV-027: wrong supersedes_epoch => EPOCH_SUPERSESSION_MISMATCH', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      authority: {
        ...baseCtx.authority,
        epoch: 40,
        supersedes_epoch: 39, // wrong; should be 40
      },
    };
    const f = findingFor(ctx, 'INV-027');
    assertFinding(f, 'INV-027', 'EPOCH_SUPERSESSION_MISMATCH', 'CRITICAL');
  });

  // INV-027: wrong previous_control_sha256
  it('INV-027: wrong previous_control_sha256 => EPOCH_SUPERSESSION_MISMATCH', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      authority: {
        ...baseCtx.authority,
        epoch: 40,
        supersedes_epoch: 40,
        previous_control_sha256: 'wrong-sha-' + '0'.repeat(54),
      },
    };
    const f = findingFor(ctx, 'INV-027');
    assertFinding(f, 'INV-027', 'EPOCH_SUPERSESSION_MISMATCH', 'CRITICAL');
  });

  // INV-028: lower epoch (rollback)
  it('INV-028: lower epoch => EPOCH_ROLLBACK_ATTEMPT', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      proposal_epoch: 38,
    };
    const f = findingFor(ctx, 'INV-028');
    assertFinding(f, 'INV-028', 'EPOCH_ROLLBACK_ATTEMPT', 'CRITICAL');
  });

  // INV-028: duplicate epoch (same as live)
  it('INV-028: duplicate epoch (== live) => EPOCH_ROLLBACK_ATTEMPT', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      proposal_epoch: 40,
    };
    const f = findingFor(ctx, 'INV-028');
    assertFinding(f, 'INV-028', 'EPOCH_ROLLBACK_ATTEMPT', 'CRITICAL');
  });

  // INV-028: skipped epoch
  it('INV-028: skipped epoch (live + 2) => EPOCH_ROLLBACK_ATTEMPT', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      proposal_epoch: 42, // live is 40, so 41 is next; 42 skips
    };
    const f = findingFor(ctx, 'INV-028');
    assertFinding(f, 'INV-028', 'EPOCH_ROLLBACK_ATTEMPT', 'CRITICAL');
  });

  // INV-028: previously published epoch number (even if it would be successor)
  it('INV-028: previously published epoch => EPOCH_ROLLBACK_ATTEMPT', () => {
    // Set live to 38 so that 39 would be the "next", but 39 is already published
    const ctx: ValidationContext = {
      ...baseCtx,
      authority: {
        ...baseCtx.authority,
        epoch: 38,
        supersedes_epoch: 38,
        published_epochs: [1, 2, 3, 38, 39],
      },
      proposal_epoch: 39, // 38+1=39 but already in published_epochs
    };
    const f = findingFor(ctx, 'INV-028');
    assertFinding(f, 'INV-028', 'EPOCH_ROLLBACK_ATTEMPT', 'CRITICAL');
  });

});
