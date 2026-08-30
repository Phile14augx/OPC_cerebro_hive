import { describe, expect, it } from 'vitest';
import { SchemaRegistry } from '../../src/schemas/registry.js';
import { captureDirtyState } from '../../src/forensics.js';

const sha = 'a'.repeat(40);
const validWorktree = {
  schema_version: '1.0.0',
  id: 'worktree',
  canonical_path: 'C:/worktree',
  repository_id: 'repo',
  git_common_dir: 'C:/worktree/.git',
  branch: 'main',
  head_sha: sha,
  tree_sha: sha,
  object_format: 'sha1',
  approved_base_sha: sha,
  owner: 'builder',
  access_mode: 'READ_ONLY',
  lane: 'lane',
  lease_id: 'lease',
  fencing_token: 1,
  upstream: 'origin/main',
  ahead_count: 0,
  behind_count: 0,
  staged: {},
  unstaged: {},
  untracked: {},
  ignored_relevant: {},
  submodules: {},
  lfs: {},
  sparse_checkout: {},
  operation_state: {},
  lock_state: {},
  dirty_fingerprint: 'c'.repeat(64),
  per_file_evidence: [],
  external_mutation_state: 'CLEAN',
  last_stable_baseline: 'd'.repeat(64),
  git_config: [],
  hooks: [],
  filters: [],
  attributes: [],
  alternates: [],
  repository_boundary_risk_findings: []
};

describe('Forensics negative tests', () => {
  const registry = new SchemaRegistry();

  it('fails validation when worktree staged property has unexpected keys', () => {
    const invalidWorktree = {
      ...validWorktree,
      staged: { some_file: 'modified' }
    };
    
    const result = registry.validate('worktree', invalidWorktree);
    expect(result.valid).toBe(false);
    expect(result.findings[0]?.code).toBe('CONTROL_SCHEMA_INVALID');
  });

  it('fails validation when worktree unstaged property has unexpected keys', () => {
    const invalidWorktree = {
      ...validWorktree,
      unstaged: { 'test.ts': 'added' }
    };
    
    const result = registry.validate('worktree', invalidWorktree);
    expect(result.valid).toBe(false);
    expect(result.findings[0]?.code).toBe('CONTROL_SCHEMA_INVALID');
  });

  it('fails validation when worktree untracked property has unexpected keys', () => {
    const invalidWorktree = {
      ...validWorktree,
      untracked: { 'new_file.ts': true }
    };
    
    const result = registry.validate('worktree', invalidWorktree);
    expect(result.valid).toBe(false);
    expect(result.findings[0]?.code).toBe('CONTROL_SCHEMA_INVALID');
  });

  it('proves structurally invalid dirty state from generator fails validation', () => {
    const dirtyState = captureDirtyState('M file.ts\n');
    
    // Maliciously mutate the return value to simulate an improper generator implementation
    // that includes extra properties in staged/unstaged/untracked.
    (dirtyState.staged as Record<string, unknown>)['extra_property'] = 'invalid';
    
    const invalidWorktree = {
      ...validWorktree,
      ...dirtyState
    };
    
    const result = registry.validate('worktree', invalidWorktree);
    expect(result.valid).toBe(false);
    expect(result.findings[0]?.code).toBe('CONTROL_SCHEMA_INVALID');
  });
});
