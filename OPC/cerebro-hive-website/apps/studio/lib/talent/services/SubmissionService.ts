import { prisma } from '@cerebro/db';
import { TalentPolicyEngine } from '../auth/policy';
import { ExecutionResult } from '../engine/execution';

export class SubmissionService {
  private policy = new TalentPolicyEngine();

  async submitExecution(
    userId: string,
    sessionId: string,
    results: ExecutionResult[]
  ): Promise<{ success: boolean; metrics?: Record<string, unknown> }> {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { assessmentVersion: { include: {
        assessment: {
          select: { workspaceId: true }
        } } }
      }
    });

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const authorized = await this.policy.authorize(
      userId,
      {
        resourceType: 'session',
        resourceId: session.id,
        tenantId: '',
        workspaceId: session.assessmentVersion.assessment.workspaceId,
        ownerUserId: session.candidateId
      },
      { resource: 'talent_sessions', action: 'submit', key: 'talent_sessions:submit', serialized: 'talent_sessions:submit' } as unknown as import('../auth/policy').TalentPermissionTuple
    );

    if (!authorized) {
      throw new Error('Unauthorized');
    }

    // In a real implementation, we would aggregate the results into metrics
    const metrics = {
      passed: results.filter(r => r.exitCode === 0).length,
      total: results.length
    };

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: 'SUBMITTED',
        metrics: metrics
      }
    });

    return { success: true, metrics };
  }
}
