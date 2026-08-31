import { describe, expect, it } from 'vitest';
import { validateManifest } from '../../src/manifest.js';

const validSha40 = 'a'.repeat(40);
const validSha64 = 'b'.repeat(64);

describe('Manifest negative tests', () => {
  const baseManifest = {
    schema_version: '1.0.0',
    control_plane_version: 'W3.05',
    validator_version: '1.0.0',
    source_commit: validSha40,
    run_id: 'run-1',
    execution_id: 'exec-1',
    actor_id: 'builder-1',
    access_mode: 'READ_WRITE',
    live_control_path: 'C:/control',
    live_control_sha256: validSha64,
    live_epoch: 1,
    parser_version: '1.0',
    repository_id: 'repo-1',
    object_ids: [validSha40],
    tree_ids: [validSha40],
    refs: ['refs/heads/main'],
    registry_digests: [validSha64],
    gate_results: ['passed'],
    reason_codes: [],
    planned_mutations: [],
    publication_target: 'target-1',
    redaction_result: 'clean'
  };

  it('rejects manifest with malformed structure (missing required fields)', () => {
    const missingRunId = { ...baseManifest } as Record<string, unknown>;
    delete missingRunId.run_id;
    const result = validateManifest(missingRunId);
    expect(result.valid).toBe(false);
    expect(result.findings[0]?.code).toBe('CONTROL_SCHEMA_INVALID');
  });

  it('rejects manifest with unapproved artifact digests (invalid length/chars)', () => {
    const invalidManifest = {
      ...baseManifest,
      object_ids: ['invalid-digest']
    };
    const result = validateManifest(invalidManifest);
    expect(result.valid).toBe(false);
    expect(result.findings[0]?.code).toBe('CONTROL_SCHEMA_INVALID');
  });

  it('rejects manifest with unapproved registry digests (not 64 hex)', () => {
    const invalidManifest = {
      ...baseManifest,
      registry_digests: [validSha40] // requires 64
    };
    const result = validateManifest(invalidManifest);
    expect(result.valid).toBe(false);
    expect(result.findings[0]?.code).toBe('CONTROL_SCHEMA_INVALID');
  });
});
