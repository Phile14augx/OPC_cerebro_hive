import { describe, expect, it } from 'vitest';
import { validateManifest } from '../../src/manifest.js';

const validSha40 = 'a'.repeat(40);
const validSha64 = 'b'.repeat(64);

describe('Manifest positive tests', () => {
  it('accepts a fully compliant manifest', () => {
    const validManifest = {
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

    const result = validateManifest(validManifest);
    expect(result.valid).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(result.value).toEqual(validManifest);
  });
});
