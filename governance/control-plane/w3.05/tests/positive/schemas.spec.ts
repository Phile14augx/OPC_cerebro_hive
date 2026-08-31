import { describe, expect, it } from 'vitest';

import { SCHEMA_NAMES, SchemaRegistry } from '../../src/schemas/registry.js';

const sha = 'a'.repeat(40);

describe('SchemaRegistry positive contracts', () => {
  const registry = new SchemaRegistry();

  it.each(SCHEMA_NAMES)('loads and compiles the %s schema', (name) => {
    // Break caught: a registry omission makes an authority contract unavailable for validation.
    expect(registry.has(name)).toBe(true);
    expect(() => registry.compile(name)).not.toThrow();
  });

  it('accepts a complete product contract with exact scopes', () => {
    // Break caught: valid write-boundary contracts are rejected despite carrying every required scope and gate.
    const result = registry.validate('product-contract', { schema_version: '1.0.0', product_id: 'product-a', canonical_name: 'Product A', lifecycle: 'DRAFT', builder_id: 'builder', verifier_id: 'verifier', worktree_id: 'product-a', branch: 'main', approved_base_sha: sha, current_head_sha: sha, allow_scopes: ['/work/product-a/src'], deny_scopes: ['/work/product-a/secrets'], dependencies: [], acceptance_criteria: ['build succeeds'], commands: { lint: 'npm run lint', typecheck: 'npm run typecheck', unit: 'npm test', integration: 'npm test -- integration', build: 'npm run build', negative_control: 'npm test -- negative', security: 'npm run security' }, current_maturity: 'ALPHA', target_maturity: 'BETA', integration_target: 'main', promotion_gate: 'review', dirty_reconciliation: [], shared_infra_requests: [], handoff_status: 'NONE', handoff_evidence: [], handoff_expires_at: '2026-08-30T00:00:00Z', acknowledgements: [] });
    expect(result).toMatchObject({ valid: true, findings: [] });
  });

  it('accepts complete Agent and Worktree evidence records', () => {
    // Break caught: a fully specified registry entry is rejected after required evidence is added.
    const agent = registry.validate('agent', { schema_version: '1.0.0', id: 'builder', role: 'PRODUCT_BUILDER', provider: 'codex', runtime_version: '1', access_mode: 'READ_ONLY', capabilities: ['validate'], lane: 'lane', worktree_id: 'worktree', branch: 'main', scope_ref: 'C:/worktree/src', state: 'IDLE', counterpart_id: 'verifier', ownership_state: 'ASSIGNED', lease_id: 'lease', lease_expires_at: 'later', renewal_state: 'CURRENT', fencing_token: 1, last_validated_epoch: 40, last_validated_control_sha256: 'b'.repeat(64), heartbeat_evidence: 'evidence' });
    const worktree = registry.validate('worktree', { schema_version: '1.0.0', id: 'worktree', canonical_path: 'C:/worktree', repository_id: 'repo', git_common_dir: 'C:/worktree/.git', branch: 'main', head_sha: sha, tree_sha: sha, object_format: 'sha1', approved_base_sha: sha, owner: 'builder', access_mode: 'READ_ONLY', lane: 'lane', lease_id: 'lease', fencing_token: 1, upstream: 'origin/main', ahead_count: 0, behind_count: 0, staged: {}, unstaged: {}, untracked: {}, ignored_relevant: {}, submodules: {}, lfs: {}, sparse_checkout: {}, operation_state: {}, lock_state: {}, dirty_fingerprint: 'c'.repeat(64), per_file_evidence: [], external_mutation_state: 'CLEAN', last_stable_baseline: 'd'.repeat(64), git_config: [], hooks: [], filters: [], attributes: [], alternates: [], repository_boundary_risk_findings: [] });
    expect(agent).toMatchObject({ valid: true, findings: [] });
    expect(worktree).toMatchObject({ valid: true, findings: [] });
  });
});
