import { TalentPolicyEngine } from '../auth/policy';

/**
 * @internal
 * SYNTHETIC PLACEHOLDER — no production persistence path exists.
 *
 * AssessmentResource was removed from the Prisma schema intentionally.
 * This service has no canonical artifact source (MinIO object key or
 * ExecutionArtifact record). It MUST NOT be wired to unknown production route
 * until a real storage model is established.
 *
 * The current implementation is structurally denial-closed: the empty
 * workspaceId causes TalentPolicyEngine to return null at the
 * `!target.workspaceId` guard, throwing 'Unauthorized' before unknown URL
 * is returned. Even if authorization were to pass, this service now
 * throws ARTIFACT_SOURCE_UNAVAILABLE instead of returning a synthetic URL.
 *
 * Resolution steps before production use:
 *  1. Determine the canonical artifact source:
 *     - ExecutionArtifact (if artifacts are execution outputs); or
 *     - MinIO/S3 presigned URL (if artifacts are file uploads).
 *  2. Implement getDownloadUrl() against that canonical source.
 *  3. Remove this annotation and the ARTIFACT_SOURCE_UNAVAILABLE throw.
 *  4. Wire authorization with a real resourceId → workspaceId lookup.
 */
export class ArtifactService {
  private policy = new TalentPolicyEngine();

  async getDownloadUrl(userId: string, assessmentId: string): Promise<never> {
    const authorized = await this.policy.authorize(
      userId,
      {
        resourceType: 'assessment_version',
        resourceId: assessmentId,
        tenantId: '',
        workspaceId: '',
        ownerUserId: null
      },
      { resource: 'talent_assessments', action: 'read', key: 'talent_assessments:read', serialized: 'talent_assessments:read' } as unknown as import('../auth/policy').TalentPermissionTuple
    );

    if (!authorized) {
      throw new Error('Unauthorized');
    }

    // This branch is currently unreachable: the empty workspaceId causes
    // TalentPolicyEngine to deny before reaching here. Nevertheless, no
    // real artifact source is available, so we fail closed explicitly
    // rather than returning a synthetic URL that could be mistaken for production.
    throw new Error('ARTIFACT_SOURCE_UNAVAILABLE: No production persistence model for artifacts exists. See @internal annotation.');
  }
}
