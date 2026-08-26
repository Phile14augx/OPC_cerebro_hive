import { prisma } from '@cerebro/db';
import { TalentPolicyEngine } from '../auth/policy';

export interface TelemetryEvent {
  type: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export class TelemetryService {
  private policy = new TalentPolicyEngine();

  async logEvent(userId: string, sessionId: string, event: TelemetryEvent): Promise<void> {
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
      { resource: 'talent_session_telemetry', action: 'write', key: 'talent_session_telemetry:write', serialized: 'talent_session_telemetry:write' } as unknown as import('../auth/policy').TalentPermissionTuple
    );

    if (!authorized) {
      throw new Error('Unauthorized');
    }

    await prisma.sessionTelemetryBatch.create({
      data: {
        sessionId, sequence: Math.floor(Math.random() * 1000000),
        events: [event as unknown] as unknown as import('@cerebro/db').Prisma.InputJsonValue
      }
    });
  }
}
