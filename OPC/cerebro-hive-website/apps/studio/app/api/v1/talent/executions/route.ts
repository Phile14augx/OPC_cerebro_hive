import { NextRequest } from 'next/server';
import { ExecutionService } from '../../../../../lib/talent/infrastructure/execution/ExecutionService';
import { ApiUtils } from '../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../lib/talent/auth/middleware';

const executionService = new ExecutionService();

export async function POST(req: NextRequest) {
  const clonedReq = req.clone();
  let body: { sessionId?: string; language?: string; code?: string } = {};
  try {
    body = await clonedReq.json();
  } catch {
    return ApiUtils.badRequest('Invalid JSON body');
  }

  const { sessionId } = body;
  if (!sessionId) {
    return ApiUtils.badRequest('sessionId is required');
  }

  const target = { resourceType: 'session', resourceId: sessionId };
  
  return withAuthorization(req, 'CREATE_EXECUTION', 'talent_executions', async () => {
    try {
      const { language, code } = body;

      if (!language || !code) {
        return ApiUtils.badRequest('language and code are required');
      }

      const job = await executionService.submitExecution(sessionId, language, code);

      return ApiUtils.success(job, undefined, 201);
    } catch (error: unknown) {
      return ApiUtils.error('Failed to submit execution job', 500, error);
    }
  }, target);
}
