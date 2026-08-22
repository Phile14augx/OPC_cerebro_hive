import { NextRequest } from 'next/server';
import { SessionService } from '../../../../../../../lib/talent/services/SessionService';
import { ApiUtils } from '../../../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../../../lib/talent/auth/middleware';

const sessionService = new SessionService();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  return withAuthorization(req, 'SUBMIT_SESSION', '*', async (req: any, userContext: any) => {
    try {
      const { id: sessionId } = await params;
      const session = await sessionService.submitSession(sessionId);

      return ApiUtils.success(session);
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    } catch (error: any) {
      return ApiUtils.error('Failed to submit session', 500, error);
    }
  });
}
