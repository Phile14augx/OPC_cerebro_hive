// @vitest-environment node

/**
 * ArtifactService Outcome A′ boundary proof.
 *
 * Proves that the service:
 *  1. Throws 'Unauthorized' when authorization is denied (normal denial path).
 *  2. Throws 'ARTIFACT_SOURCE_UNAVAILABLE', never emits a synthetic URL,
 *     even when authorization is mocked to succeed.
 *
 * These tests document and enforce the synthetic boundary declared in the
 * @internal annotation on ArtifactService.
 */

import { describe, expect, it, vi } from 'vitest';

const policyMock = vi.hoisted(() => ({ authorize: vi.fn() }));
vi.mock('../auth/policy', () => ({ TalentPolicyEngine: vi.fn(() => policyMock) }));

import { ArtifactService } from './ArtifactService';

describe('ArtifactService synthetic boundary (Outcome A-prime)', () => {
  it('throws Unauthorized when authorization is denied (normal denial path)', async () => {
    policyMock.authorize.mockResolvedValue(null);
    await expect(
      new ArtifactService().getDownloadUrl('user-1', 'assessment-1'),
    ).rejects.toThrow('Unauthorized');
  });

  it('throws ARTIFACT_SOURCE_UNAVAILABLE, not a synthetic URL, when authorization passes', async () => {
    policyMock.authorize.mockResolvedValue({
      userId: 'u',
      tenantId: 't',
      workspaceId: 'ws',
      roleId: 'r',
      roleName: 'Recruiter',
      permissions: ['talent_assessments:read'],
      resourceType: 'assessment_version',
      resourceId: 'av-1',
    });

    const svc = new ArtifactService();

    // Must throw — never resolves
    await expect(svc.getDownloadUrl('user-1', 'assessment-1')).rejects.toThrow(
      'ARTIFACT_SOURCE_UNAVAILABLE',
    );
  });

  it('never emits a string containing the synthetic mock token under unknown authorization outcome', async () => {
    const outcomes = [null, { userId: 'u', tenantId: 't', workspaceId: 'ws', roleId: 'r', roleName: 'R', permissions: [], resourceType: 'w', resourceId: 'r' }];

    for (const outcome of outcomes) {
      policyMock.authorize.mockResolvedValue(outcome);
      let caught: Error | null = null;
      try {
        await new ArtifactService().getDownloadUrl('u', 'a');
      } catch (e: unknown) {
        caught = e instanceof Error ? e : null;
      }
      expect(caught).not.toBeNull();
      // The resolved value (URL string) never reaches the caller — only errors do
      expect(caught?.message).not.toContain('?token=mock');
    }
  });
});
