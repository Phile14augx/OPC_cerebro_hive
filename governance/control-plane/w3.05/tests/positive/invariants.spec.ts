/**
 * W3.05 Invariant Engine — Positive Test Suite (Task 8)
 *
 * For each of the 28 invariants: one clean ValidationContext that produces
 * zero findings. 28 positive test cases minimum.
 */
import { describe, expect, it } from 'vitest';
import {
  evaluateInvariants,
  ValidationContext,
} from '../../src/validator/invariants.js';

// ---------------------------------------------------------------------------
// Base clean context: all invariants pass when this is used unmodified.
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
// Helper
// ---------------------------------------------------------------------------

function noFindings(ctx: ValidationContext, id: string): void {
  const findings = evaluateInvariants(ctx);
  const relevant = findings.filter((f) => f.invariant_id === id);
  expect(
    relevant,
    `${id}: expected no findings but got ${JSON.stringify(relevant)}`,
  ).toHaveLength(0);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Invariant Engine — Positive Suite', () => {
  it('INV-001: exactly one write owner', () => {
    noFindings(baseCtx, 'INV-001');
  });

  it('INV-002: distinct builder and verifier', () => {
    noFindings(baseCtx, 'INV-002');
  });

  it('INV-003: builder stays within scope (touched in allowed)', () => {
    noFindings(baseCtx, 'INV-003');
  });

  it('INV-004: product builder touches no recovery paths', () => {
    noFindings(baseCtx, 'INV-004');
  });

  it('INV-005: recovery builder — not applicable (role is PRODUCT_BUILDER)', () => {
    const ctx: ValidationContext = { ...baseCtx, builder_role: 'RECOVERY_BUILDER' };
    // recovery builder with no product_paths touched
    const ctxClean: ValidationContext = {
      ...ctx,
      scope: {
        ...ctx.scope,
        touched_paths: ['src/recovery/f16/fix.ts'],
        product_paths: ['src/products/p10'],
      },
    };
    noFindings(ctxClean, 'INV-005');
  });

  it('INV-006: all shared infra resources have owner and active lease', () => {
    noFindings(baseCtx, 'INV-006');
  });

  it('INV-007: no dirty files', () => {
    noFindings(baseCtx, 'INV-007');
  });

  it('INV-008: HEAD matches expected', () => {
    noFindings(baseCtx, 'INV-008');
  });

  it('INV-009: filesystem fingerprint matches expected', () => {
    noFindings(baseCtx, 'INV-009');
  });

  it('INV-010: no git locks present', () => {
    noFindings(baseCtx, 'INV-010');
  });

  it('INV-011: attestation not required, no finding', () => {
    noFindings(baseCtx, 'INV-011');
  });

  it('INV-011: attestation required and fully valid', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      attestation_required: true,
      attestation: {
        attested_commit_sha: 'deadbeef' + '0'.repeat(32),
        attested_repository: 'owner/repo',
        all_required_checks_passed: true,
        approved_ref_reachable: true,
        evidence_captured_at: '2026-08-31T12:00:00Z',
        freshness_deadline: '2026-08-31T11:00:00Z', // deadline < captured_at => fresh
      },
    };
    noFindings(ctx, 'INV-011');
  });

  it('INV-012: historical epoch SHA unchanged', () => {
    noFindings(baseCtx, 'INV-012');
  });

  it('INV-013: not a proposal context, no finding', () => {
    noFindings(baseCtx, 'INV-013');
  });

  it('INV-013: proposal context with coherent authority', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_proposal_context: true,
      manifest_authority_coherent: true,
    };
    noFindings(ctx, 'INV-013');
  });

  it('INV-014: not a publication context, no finding', () => {
    noFindings(baseCtx, 'INV-014');
  });

  it('INV-014: publication context, hashes match', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_publication_context: true,
      expected_live_sha256: LIVE_SHA,
      actual_live_sha256: LIVE_SHA,
    };
    noFindings(ctx, 'INV-014');
  });

  it('INV-015: not a publication context, no finding', () => {
    noFindings(baseCtx, 'INV-015');
  });

  it('INV-015: publication context, CAS hashes match', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_publication_context: true,
      expected_live_sha256: LIVE_SHA,
      actual_live_sha256: LIVE_SHA,
    };
    noFindings(ctx, 'INV-015');
  });

  it('INV-016: live YAML is valid', () => {
    noFindings(baseCtx, 'INV-016');
  });

  it('INV-017: no pending handoff', () => {
    noFindings(baseCtx, 'INV-017');
  });

  it('INV-017: acknowledged handoff does not block', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      handoff: {
        status: 'HANDOFF_ACKNOWLEDGED',
        to_agent: 'CODEX_B2',
        expiry: '2026-09-01T00:00:00Z',
        current_time: '2026-08-31T00:00:00Z',
      },
    };
    noFindings(ctx, 'INV-017');
  });

  it('INV-018: attestation null, no finding', () => {
    const ctx: ValidationContext = { ...baseCtx, attestation: null };
    noFindings(ctx, 'INV-018');
  });

  it('INV-018: attestation has canonical repo and approved ref', () => {
    noFindings(baseCtx, 'INV-018');
  });

  it('INV-019: lease presented_fencing_token equals current token', () => {
    noFindings(baseCtx, 'INV-019');
  });

  it('INV-019: no lease present', () => {
    const ctx: ValidationContext = { ...baseCtx, lease: null };
    noFindings(ctx, 'INV-019');
  });

  it('INV-020: manifest authority is coherent', () => {
    noFindings(baseCtx, 'INV-020');
  });

  it('INV-021: not post-abort, no finding', () => {
    noFindings(baseCtx, 'INV-021');
  });

  it('INV-021: post-abort and state proven unchanged', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_post_abort: true,
      state_unchanged_after_abort: true,
    };
    noFindings(ctx, 'INV-021');
  });

  it('INV-022: output is deterministic', () => {
    noFindings(baseCtx, 'INV-022');
  });

  it('INV-023: secrets are redacted', () => {
    noFindings(baseCtx, 'INV-023');
  });

  it('INV-024: not a resume/retry context, no finding', () => {
    noFindings(baseCtx, 'INV-024');
  });

  it('INV-024: resume/retry with full re-validation', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_resume_or_retry: true,
      resume_revalidated: true,
    };
    noFindings(ctx, 'INV-024');
  });

  it('INV-025: not a publication context, no finding', () => {
    noFindings(baseCtx, 'INV-025');
  });

  it('INV-025: publication context with complete evidence', () => {
    const ctx: ValidationContext = {
      ...baseCtx,
      is_publication_context: true,
      publication_evidence_complete: true,
      expected_live_sha256: LIVE_SHA,
      actual_live_sha256: LIVE_SHA,
    };
    noFindings(ctx, 'INV-025');
  });

  it('INV-026: proposal_epoch == live_epoch + 1', () => {
    noFindings(baseCtx, 'INV-026');
  });

  it('INV-027: supersedes_epoch == live_epoch AND sha256 matches', () => {
    noFindings(baseCtx, 'INV-027');
  });

  it('INV-028: proposal_epoch is live + 1, not previously published', () => {
    noFindings(baseCtx, 'INV-028');
  });

  it('evaluateInvariants returns empty array for fully clean context', () => {
    const findings = evaluateInvariants(baseCtx);
    expect(findings).toHaveLength(0);
  });
});
