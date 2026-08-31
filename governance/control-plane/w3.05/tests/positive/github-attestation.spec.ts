import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GithubAttestor } from '../../src/capture/github.js';

const positiveMockFetch = async (url: string | URL | globalThis.Request): Promise<Response> => {
  const urlStr = url.toString();
  
  if (urlStr === 'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive') {
    return new Response(JSON.stringify({
      id: 89123456,
      node_id: 'R_kgDOHive01',
      name: 'OPC_cerebro_hive',
      full_name: 'Phile14augx/OPC_cerebro_hive',
      private: true,
      owner: { login: 'Phile14augx' },
      default_branch: 'main'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  
  if (urlStr === 'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718') {
    return new Response(JSON.stringify({
      sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718',
      node_id: 'C_kwDOHive01Commit01',
      commit: {
        tree: { sha: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678' },
        message: 'feat(governance): enforce exact sha attestation',
        verification: { verified: true, reason: 'valid' }
      },
      parents: [
        { sha: 'f1e2d3c4b5a60718293a4b5c6d7e8f9012345679' }
      ]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (urlStr === 'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/rules/branches/main') {
    return new Response(JSON.stringify([
      {
        id: 40912,
        source_type: 'Repository',
        source: 'Phile14augx/OPC_cerebro_hive',
        rules: [
          {
            type: 'required_status_checks',
            parameters: {
              required_status_checks: [
                { context: 'lint' },
                { context: 'typecheck' },
                { context: 'unit-test' },
                { context: 'build' }
              ]
            }
          }
        ]
      }
    ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (urlStr === 'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718/check-runs') {
    return new Response(JSON.stringify({
      total_count: 4,
      check_runs: [
        { id: 1001, name: 'lint', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:15:00Z', head_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718' },
        { id: 1002, name: 'typecheck', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:16:00Z', head_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718' },
        { id: 1003, name: 'unit-test', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:18:00Z', head_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718' },
        { id: 1004, name: 'build', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:20:00Z', head_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718' }
      ]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  
  if (urlStr === 'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/branches/main/protection') {
    return new Response('Not Found', { status: 404 });
  }

  return new Response('Not Found', { status: 404 });
};

describe('GitHub Attestation - Positive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-31T12:30:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates valid CiAttestation record when all checks and policies pass', async () => {
    const attestor = new GithubAttestor({ fetch: positiveMockFetch });
    const result = await attestor.attest({
      canonical_host: 'github.com',
      canonical_owner: 'Phile14augx',
      canonical_repo: 'OPC_cerebro_hive',
      canonical_repo_id: 'R_kgDOHive01',
      target_commit_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718',
      approved_ref: 'refs/heads/main',
      pr_number: 42,
      freshness_window_seconds: 3600
    });

    expect(result.valid).toBe(true);
    expect(result.findings).toEqual([]);
    
    expect(result.attestation).toMatchObject({
      schema_version: '1.0.0',
      host: 'github.com',
      owner: 'Phile14augx',
      repository: 'OPC_cerebro_hive',
      repository_id: 'R_kgDOHive01',
      remote_url: 'https://github.com/Phile14augx/OPC_cerebro_hive.git',
      remote_identity_verified: true,
      commit_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718',
      object_format: 'sha1',
      tree_sha: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
      parents: ['f1e2d3c4b5a60718293a4b5c6d7e8f9012345679'],
      signature_status: 'VALID',
      approved_ref_reachability: true,
      candidate_exists: true,
      branch: 'main',
      pr_number: 42,
      workflow_name: 'CI',
      run_id: 'run-89123456',
      check_id: 'check-suite-1001',
      status: 'COMPLETED',
      conclusion: 'SUCCESS',
      evidence_source: 'GITHUB_REST_API',
      captured_at: '2026-08-31T12:30:00Z',
      freshness: 'VALID_FRESH',
      artifact_digests: ['d5f9e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718293a4b5c6d7e8f901234'],
      expected_checks: ['build', 'lint', 'typecheck', 'unit-test'],
      observed_checks: ['build', 'lint', 'typecheck', 'unit-test'],
      policy_source: 'GITHUB_RULESET',
      policy_id: '40912',
      policy_digest: '5c5124f3b871dba23c67d77731331916f58c602be7424aa6c6a1bffda599b07e',
      policy_captured_at: '2026-08-31T12:30:00Z',
      policy_freshness: 'VALID_FRESH',
      skipped_treatment: 'FAIL_CLOSED',
      missing_treatment: 'FAIL_CLOSED',
      neutral_treatment: 'FAIL_CLOSED',
      cancelled_treatment: 'FAIL_CLOSED',
      stale_treatment: 'FAIL_CLOSED',
      exact_candidate_binding: true,
      wrong_repository_rejected: true
    });
  });
});
