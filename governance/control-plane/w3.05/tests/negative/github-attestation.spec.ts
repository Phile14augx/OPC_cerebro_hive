import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GithubAttestor } from '../../src/capture/github.js';

function createMockFetch(overrides: Record<string, unknown>) {
  return async (url: string | URL | globalThis.Request): Promise<Response> => {
    const urlStr = url.toString();
    if (overrides[urlStr]) {
      const { status, body } = overrides[urlStr];
      return new Response(body ? JSON.stringify(body) : 'Not Found', { status, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Default mocks if not overridden
    if (urlStr === 'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive') {
      return new Response(JSON.stringify({
        id: 89123456, node_id: 'R_kgDOHive01', name: 'OPC_cerebro_hive', full_name: 'Phile14augx/OPC_cerebro_hive',
        private: true, owner: { login: 'Phile14augx' }, default_branch: 'main'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (urlStr.startsWith('https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/')) {
      if (urlStr.includes('/check-runs')) {
        return new Response(JSON.stringify({
          total_count: 4,
          check_runs: [
            { id: 1001, name: 'lint', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:15:00Z', head_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718' },
            { id: 1002, name: 'typecheck', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:16:00Z', head_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718' },
            { id: 1003, name: 'unit-test', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:18:00Z', head_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718' },
            { id: 1004, name: 'build', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:20:00Z', head_sha: 'e8a71f09c5d2e3b4a1c8f9d0e1b2c3d4e5f60718' }
          ]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } else {
        return new Response(JSON.stringify({
          sha: urlStr.split('/').pop(), node_id: 'C_kwDOHive01Commit01',
          commit: { tree: { sha: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678' }, message: 'commit msg', verification: { verified: true, reason: 'valid' } },
          parents: [{ sha: 'f1e2d3c4b5a60718293a4b5c6d7e8f9012345679' }]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }
    if (urlStr === 'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/rules/branches/main') {
      return new Response(JSON.stringify([
        {
          id: 40912, source_type: 'Repository', source: 'Phile14augx/OPC_cerebro_hive',
          rules: [{ type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'lint' }, { context: 'typecheck' }, { context: 'unit-test' }, { context: 'build' }] } }]
        }
      ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Not Found', { status: 404 });
  };
}

describe('GitHub Attestation - Negative', () => {
  const defaultReq = {
    canonical_host: 'github.com', canonical_owner: 'Phile14augx', canonical_repo: 'OPC_cerebro_hive', canonical_repo_id: 'R_kgDOHive01',
    target_commit_sha: '34245c65efb485b74b84128b876ec04c46659a81', approved_ref: 'refs/heads/main', freshness_window_seconds: 3600
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-31T12:30:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('NEG-01: Wrong Repository', async () => {
    const fetchFn = createMockFetch({
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive': { status: 200, body: { node_id: 'R_kgDOOtherRepo' } }
    });
    const result = await new GithubAttestor({ fetch: fetchFn }).attest(defaultReq);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'REMOTE_REPOSITORY_MISMATCH', severity: 'BLOCKING' }));
  });

  it('NEG-02 & NEG-03: Absent SHA / Fork-Only SHA', async () => {
    const fetchFn = createMockFetch({
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/34245c65efb485b74b84128b876ec04c46659a81': { status: 404 }
    });
    const result = await new GithubAttestor({ fetch: fetchFn }).attest(defaultReq);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'REMOTE_COMMIT_ABSENT', severity: 'BLOCKING' }));
  });

  it('NEG-04: Stale Evidence', async () => {
    vi.setSystemTime(new Date('2026-08-31T12:00:00Z'));
    const fetchFn = createMockFetch({
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/34245c65efb485b74b84128b876ec04c46659a81/check-runs': {
        status: 200, body: { total_count: 1, check_runs: [{ name: 'build', status: 'completed', conclusion: 'success', completed_at: '2026-08-29T10:00:00Z' }] }
      },
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/rules/branches/main': {
        status: 200, body: [{ id: 1, rules: [{ type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'build' }] } }] }]
      }
    });
    const req = { ...defaultReq, freshness_window_seconds: 86400 }; // 24 hours
    const result = await new GithubAttestor({ fetch: fetchFn }).attest(req);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'REMOTE_ATTESTATION_STALE', severity: 'BLOCKING' }));
  });

  it('NEG-06: Required Check Missing', async () => {
    const fetchFn = createMockFetch({
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/34245c65efb485b74b84128b876ec04c46659a81/check-runs': {
        status: 200, body: {
          total_count: 3, check_runs: [
            { name: 'build', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:15:00Z' },
            { name: 'lint', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:15:00Z' },
            { name: 'test', status: 'completed', conclusion: 'success', completed_at: '2026-08-31T12:15:00Z' }
          ]
        }
      },
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/rules/branches/main': {
        status: 200, body: [{ id: 1, rules: [{ type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'build' }, { context: 'lint' }, { context: 'test' }, { context: 'security' }] } }] }]
      }
    });
    const result = await new GithubAttestor({ fetch: fetchFn }).attest(defaultReq);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'REQUIRED_CHECK_MISSING', severity: 'BLOCKING', message: expect.stringContaining('security') }));
  });

  it('NEG-07: Policy Missing', async () => {
    const fetchFn = createMockFetch({
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/rules/branches/main': { status: 200, body: [] }
    });
    const result = await new GithubAttestor({ fetch: fetchFn }).attest(defaultReq);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'REQUIRED_CHECK_POLICY_MISSING', severity: 'BLOCKING' }));
  });

  it('NEG-08: Cancelled Check', async () => {
    const fetchFn = createMockFetch({
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/34245c65efb485b74b84128b876ec04c46659a81/check-runs': {
        status: 200, body: { total_count: 1, check_runs: [{ name: 'unit-test', status: 'completed', conclusion: 'cancelled', completed_at: '2026-08-31T12:15:00Z' }] }
      }
    });
    const result = await new GithubAttestor({ fetch: fetchFn }).attest(defaultReq);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'MACHINE_GREEN_FALSE', severity: 'BLOCKING' }));
  });

  it('NEG-09: Skipped Check', async () => {
    const fetchFn = createMockFetch({
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/34245c65efb485b74b84128b876ec04c46659a81/check-runs': {
        status: 200, body: { total_count: 1, check_runs: [{ name: 'security-scan', status: 'completed', conclusion: 'skipped', completed_at: '2026-08-31T12:15:00Z' }] }
      },
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/rules/branches/main': {
        status: 200, body: [{ id: 1, rules: [{ type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'security-scan' }] } }] }]
      }
    });
    const result = await new GithubAttestor({ fetch: fetchFn }).attest(defaultReq);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'REQUIRED_CHECK_MISSING', severity: 'BLOCKING' }));
  });

  it('NEG-10: Neutral Check', async () => {
    const fetchFn = createMockFetch({
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/34245c65efb485b74b84128b876ec04c46659a81/check-runs': {
        status: 200, body: { total_count: 1, check_runs: [{ name: 'compliance-audit', status: 'completed', conclusion: 'neutral', completed_at: '2026-08-31T12:15:00Z' }] }
      }
    });
    const result = await new GithubAttestor({ fetch: fetchFn }).attest(defaultReq);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'MACHINE_GREEN_FALSE', severity: 'BLOCKING' }));
  });

  it('NEG-11: Unapproved Ref Reachability', async () => {
    const fetchFn = createMockFetch({
      'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/commits/main': {
        status: 200, body: { sha: 'different_sha' }
      }
    });
    const result = await new GithubAttestor({ fetch: fetchFn }).attest(defaultReq);
    expect(result.valid).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: 'REMOTE_REF_UNAPPROVED', severity: 'BLOCKING' }));
  });

  it('F16 REGRESSION: rejects candidate SHA when PR CI evidence is bound to previous commit SHA', async () => {
    const mockFetchF16MismatchedPr = async (url: string | URL | globalThis.Request): Promise<Response> => {
      const urlStr = url.toString();
      if (urlStr === 'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive') {
        return new Response(JSON.stringify({ node_id: 'R_kgDOHive01', name: 'OPC_cerebro_hive' }), { status: 200 });
      }
      if (urlStr === 'https://api.github.com/repos/Phile14augx/OPC_cerebro_hive/pulls/52') {
        return new Response(JSON.stringify({ head: { sha: '79f2a9d2c1b4e5f60718293a4b5c6d7e8f901234', ref: 'recovery/f16-pr-branch' } }), { status: 200 });
      }
      if (urlStr.includes('/commits/34245c65efb485b74b84128b876ec04c46659a81')) {
        if (urlStr.includes('/check-runs')) return new Response(JSON.stringify({ total_count: 0, check_runs: [] }), { status: 200 });
        return new Response(JSON.stringify({ sha: '34245c65efb485b74b84128b876ec04c46659a81' }), { status: 200 });
      }
      return new Response('Not Found', { status: 404 });
    };

    const attestor = new GithubAttestor({ fetch: mockFetchF16MismatchedPr });
    
    const result = await attestor.attest({
      canonical_host: 'github.com',
      canonical_owner: 'Phile14augx',
      canonical_repo: 'OPC_cerebro_hive',
      canonical_repo_id: 'R_kgDOHive01',
      target_commit_sha: '34245c65efb485b74b84128b876ec04c46659a81',
      approved_ref: 'refs/pull/52/head',
      pr_number: 52,
      freshness_window_seconds: 86400,
      policy_override: {
        policy_source: 'RECOVERY_CONTRACT',
        policy_id: 'F16-CI-INTEGRITY-V2',
        policy_digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        policy_captured_at: '2026-08-31T12:00:00Z',
        policy_freshness_seconds: 86400,
        expected_checks: ['lint', 'typecheck', 'unit-test', 'build']
      }
    });
  
    expect(result.valid).toBe(false);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'MACHINE_GREEN_FALSE',
          severity: 'BLOCKING',
          message: expect.stringContaining('PR #52 head SHA (79f2a9d2...) does not match candidate SHA (34245c65...)')
        }),
        expect.objectContaining({
          code: 'REQUIRED_CHECK_MISSING',
          severity: 'BLOCKING',
          message: expect.stringContaining('Missing check runs for target commit 34245c65...')
        })
      ])
    );
  });
});
