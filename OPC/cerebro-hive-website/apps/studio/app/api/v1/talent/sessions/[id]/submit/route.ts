import { NextRequest } from 'next/server';
import { SessionService } from '../../../../../../../lib/talent/services/SessionService';
import { ApiUtils } from '../../../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../../../lib/talent/auth/middleware';

const sessionService = new SessionService();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const target = { resourceType: 'session', resourceId: sessionId };

  return withAuthorization(req, 'SUBMIT_SESSION', 'talent_sessions', async () => {
    try {
      const session = await sessionService.submitSession(sessionId);

      return ApiUtils.success(session);
    } catch (error: unknown) {
      return ApiUtils.error('Failed to submit session', 500, error);
    }
  }, target);
}
