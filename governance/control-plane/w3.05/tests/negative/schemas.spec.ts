import { describe, expect, it } from 'vitest';

import { SchemaRegistry } from '../../src/schemas/registry.js';

const sha = 'a'.repeat(40);

describe('SchemaRegistry negative contracts', () => {
  const registry = new SchemaRegistry();

  it('rejects a product contract whose exact allow scope is missing', () => {
    // Break caught: a write-authorized contract could omit its exact filesystem boundary.
    const result = registry.validate('product-contract', {
      schema_version: '1.0.0', product_id: 'product-a', canonical_name: 'Product A', lifecycle: 'DRAFT', builder_id: 'builder', verifier_id: 'verifier', worktree_id: 'product-a', branch: 'main', approved_base_sha: sha, current_head_sha: sha, allow_scopes: [], deny_scopes: ['/work/product-a/secrets'], dependencies: [], acceptance_criteria: ['build succeeds'], commands: { lint: 'npm run lint', typecheck: 'npm run typecheck', unit: 'npm test', integration: 'npm test -- integration', build: 'npm run build', negative_control: 'npm test -- negative', security: 'npm run security' }, current_maturity: 'ALPHA', target_maturity: 'BETA', integration_target: 'main', promotion_gate: 'review', dirty_reconciliation: [], shared_infra_requests: [], handoff_status: 'NONE', handoff_evidence: [], handoff_expires_at: '2026-08-30T00:00:00Z', acknowledgements: []
    });
    expect(result).toMatchObject({ valid: false, reasonCode: 'SCOPE_MISSING' });
  });

  it('rejects a worktree record with an abbreviated commit object id', () => {
    // Break caught: abbreviated SHAs could bind authority to an ambiguous revision.
    const result = registry.validate('worktree', { schema_version: '1.0.0', id: 'worktree', canonical_path: 'C:/worktree', repository_id: 'repo', git_common_dir: 'C:/worktree/.git', branch: 'main', head_sha: 'abcdef0', tree_sha: sha, object_format: 'sha1', approved_base_sha: sha, owner: 'builder', access_mode: 'READ_ONLY', lane: 'lane', lease_id: 'lease', fencing_token: 1, upstream: 'origin/main', ahead_count: 0, behind_count: 0, staged: {}, unstaged: {}, untracked: {}, ignored_relevant: {}, submodules: {}, lfs: {}, sparse_checkout: {}, operation_state: {}, lock_state: {}, dirty_fingerprint: 'c'.repeat(64), per_file_evidence: [], external_mutation_state: 'CLEAN', last_stable_baseline: 'd'.repeat(64), git_config: [], hooks: [], filters: [], attributes: [], alternates: [], repository_boundary_risk_findings: [] });
    expect(result).toMatchObject({ valid: false, reasonCode: 'CONTROL_SCHEMA_INVALID' });
  });

  it('rejects a publication receipt without its predecessor digest', () => {
    // Break caught: receipt-chain substitution could remove the predecessor link.
    const result = registry.validate('publication-receipt', { schema_version: '1.0.0', control_plane_version: 'W3.05', previous_epoch: 40, previous_live_sha256: 'c'.repeat(64), proposed_epoch: 41, proposal_sha256: 'd'.repeat(64), published_epoch: 41, resulting_live_sha256: 'e'.repeat(64), publisher_id: 'governor', publication_fencing_token: 1, validation_manifest_digest: 'f'.repeat(64), independent_verifier_verdict_digest: 'a'.repeat(64), publication_result: 'SUCCESS', post_publication_verification_result: 'SUCCESS', receipt_digest: 'c'.repeat(64) });
    expect(result).toMatchObject({ valid: false, reasonCode: 'CONTROL_SCHEMA_INVALID' });
  });

  it.each([
    ['agent', 'scope_ref', 'C:/safe/../escape'],
    ['agent', 'scope_ref', 'C:/safe\\..\\escape'],
    ['worktree', 'git_common_dir', 'C:/safe/../escape'],
    ['worktree', 'git_common_dir', 'C:/..\\foo'],
    ['handoff', 'worktree', 'C:/safe/../escape'],
    ['handoff', 'worktree', 'C:/dir\\..\\..\\escape']
  ])('rejects dot-segment path escapes in %s.%s', (schema, field, escapedPath) => {
    // Break caught: non-canonical paths escape an authority record's exact filesystem boundary.
    const record = schema === 'agent'
      ? { schema_version: '1.0.0', id: 'builder', role: 'PRODUCT_BUILDER', provider: 'codex', runtime_version: '1', access_mode: 'READ_ONLY', capabilities: ['validate'], lane: 'lane', worktree_id: 'worktree', branch: 'main', scope_ref: escapedPath, state: 'IDLE', counterpart_id: 'verifier', ownership_state: 'ASSIGNED', lease_id: 'lease', lease_expires_at: 'later', renewal_state: 'CURRENT', fencing_token: 1, last_validated_epoch: 40, last_validated_control_sha256: 'b'.repeat(64), heartbeat_evidence: 'evidence' }
      : schema === 'worktree'
        ? { schema_version: '1.0.0', id: 'worktree', canonical_path: 'C:/worktree', repository_id: 'repo', git_common_dir: escapedPath, branch: 'main', head_sha: sha, tree_sha: sha, object_format: 'sha1', approved_base_sha: sha, owner: 'builder', access_mode: 'READ_ONLY', lane: 'lane', lease_id: 'lease', fencing_token: 1, upstream: 'origin/main', ahead_count: 0, behind_count: 0, staged: {}, unstaged: {}, untracked: {}, ignored_relevant: {}, submodules: {}, lfs: {}, sparse_checkout: {}, operation_state: {}, lock_state: {}, dirty_fingerprint: 'c'.repeat(64), per_file_evidence: [], external_mutation_state: 'CLEAN', last_stable_baseline: 'd'.repeat(64), git_config: [], hooks: [], filters: [], attributes: [], alternates: [], repository_boundary_risk_findings: [] }
        : { schema_version: '1.0.0', id: 'handoff', from_agent: 'builder', to_agent: 'verifier', repository_id: 'repo', worktree: escapedPath, branch: 'main', resources: ['lane'], revision_sha: sha, dirty_state_digest: 'c'.repeat(64), unfinished_task: 'verify', acceptance_criteria: ['pass'], hazards: [], acknowledgement: true, timestamp: 'now', expires_at: 'later', status: 'ACKNOWLEDGED', supersedes: null };
    expect(registry.validate(schema, record)).toMatchObject({ valid: false, reasonCode: 'CONTROL_SCHEMA_INVALID' });
  });

  it('rejects recovery scope escapes and arbitrary expected test-count keys', () => {
    // Break caught: a recovery contract can escape its scope or claim unrecognized test-count evidence.
    const result = registry.validate('recovery-contract', { schema_version: '1.0.0', tranche_id: 'recovery', objective: 'restore', baseline_sha: sha, candidate_sha: sha, tree_sha: sha, parent_sha: sha, branch: 'main', worktree: 'C:/safe/../escape', repository_id: 'repo', implementation_owner: 'builder', independent_verifier: 'verifier', publication_authority: 'governor', allow_scopes: ['C:/safe/../escape'], deny_scopes: ['C:/safe/../escape'], acceptance_criteria: ['pass'], verification_commands: ['npm test'], negative_controls: ['npm test -- negative'], expected_test_counts: { arbitrary: 1 }, local_evidence: ['local'], remote_evidence: ['remote'], github_repository_id: 'repo', approved_ref: 'main', pr_ids: [1], check_ids: ['check'], check_conclusions: ['success'], captured_at: 'now', freshness_policy: 'PT1H', human_gate: { identity: 'human', verdict: 'APPROVED', timestamp: 'now', expires_at: 'later', candidate_sha: sha }, lifecycle: 'DRAFT', rollback_model: 'revert' });
    expect(result).toMatchObject({ valid: false, reasonCode: 'CONTROL_SCHEMA_INVALID' });
  });

  it.each(['agent', 'worktree'])('rejects incomplete required %s registry evidence', (schema) => {
    // Break caught: incomplete registry entries validate despite missing SPEC-required control evidence.
    const record = schema === 'agent'
      ? { schema_version: '1.0.0', id: 'agent', role: 'PRODUCT_BUILDER', provider: 'codex', runtime_version: '1', access_mode: 'READ_ONLY', capabilities: ['validate'], lane: 'lane', worktree_id: 'worktree', branch: 'main', scope_ref: '/worktree', state: 'IDLE', lease_id: 'lease', lease_expires_at: 'later', fencing_token: 1, last_validated_epoch: 40, last_validated_control_sha256: 'b'.repeat(64), heartbeat_evidence: 'evidence' }
      : { schema_version: '1.0.0', id: 'worktree', canonical_path: '/worktree', repository_id: 'repo', git_common_dir: '/.git', branch: 'main', head_sha: sha, tree_sha: sha, object_format: 'sha1', approved_base_sha: sha, owner: 'owner', access_mode: 'READ_ONLY', lane: 'lane', fencing_token: 1, dirty_fingerprint: 'c'.repeat(64), external_mutation_state: 'CLEAN' };
    expect(registry.validate(schema, record)).toMatchObject({ valid: false, reasonCode: 'CONTROL_SCHEMA_INVALID' });
  });
});
