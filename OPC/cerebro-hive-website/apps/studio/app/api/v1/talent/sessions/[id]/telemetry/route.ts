import { NextRequest } from 'next/server';
import { SessionService } from '../../../../../../../lib/talent/services/SessionService';
import { ApiUtils } from '../../../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../../../lib/talent/auth/middleware';

const sessionService = new SessionService();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const target = { resourceType: 'session', resourceId: sessionId };

  return withAuthorization(req, 'UPDATE_SESSION', 'talent_sessions', async (req) => {
    try {
      const body = await req.json();
      const { sequence, events } = body;

      if (sequence === undefined || !Array.isArray(events)) {
        return ApiUtils.badRequest('sequence and events array are required');
      }

      const batch = await sessionService.recordTelemetry(sessionId, sequence, events);

      return ApiUtils.success({ batchId: batch.id });
    } catch (error: unknown) {
      return ApiUtils.error('Failed to record telemetry', 500, error);
    }
  }, target);
}
