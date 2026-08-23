import { NextRequest } from 'next/server';
import { SessionService } from '../../../../../lib/talent/services/SessionService';
import { ApiUtils } from '../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../lib/talent/auth/middleware';

const sessionService = new SessionService();

export async function POST(req: NextRequest) {
  const clonedReq = req.clone();
  let body: { candidateId?: string; assessmentVersionId?: string } = {};
  try {
    body = await clonedReq.json();
  } catch {
    return ApiUtils.badRequest('Invalid JSON body');
  }

  const { assessmentVersionId } = body;
  if (!assessmentVersionId) {
    return ApiUtils.badRequest('assessmentVersionId is required');
  }

  const target = { resourceType: 'assessment_version', resourceId: assessmentVersionId };

  return withAuthorization(req, 'CREATE_SESSION', 'talent_sessions', async () => {
    try {
      const { candidateId } = body;

      if (!candidateId) {
        return ApiUtils.badRequest('candidateId is required');
      }

      // Normally traceId is extracted from context; here ApiUtils attaches a fresh one on response.
      // But we want to pass it into the service. For now we pass undefined so it doesn't break,
      // or we could generate one here.
      const session = await sessionService.initializeSession(candidateId, assessmentVersionId);

      return ApiUtils.success(session, undefined, 201);
    } catch (error: unknown) {
      return ApiUtils.error('Failed to initialize session', 500, error);
    }
  }, target);
}
