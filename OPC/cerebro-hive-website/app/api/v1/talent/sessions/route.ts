import { NextRequest } from 'next/server';
import { SessionService } from '../../../../../../lib/talent/services/SessionService';
import { ApiUtils } from '../../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../../lib/talent/auth/middleware';

const sessionService = new SessionService();

export async function POST(req: NextRequest) {
  return withAuthorization(req, 'CREATE_SESSION', '*', async (req, userContext) => {
    try {
      const body = await req.json();
      const { candidateId, assessmentVersionId } = body;

      if (!candidateId || !assessmentVersionId) {
        return ApiUtils.badRequest('candidateId and assessmentVersionId are required');
      }

      // Normally traceId is extracted from context; here ApiUtils attaches a fresh one on response.
      // But we want to pass it into the service. For now we pass undefined so it doesn't break,
      // or we could generate one here.
      const session = await sessionService.initializeSession(candidateId, assessmentVersionId);

      return ApiUtils.success(session, undefined, 201);
    } catch (error: any) {
      return ApiUtils.error('Failed to initialize session', 500, error);
    }
  });
}
