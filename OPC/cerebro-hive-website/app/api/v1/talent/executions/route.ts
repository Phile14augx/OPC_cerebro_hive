import { NextRequest } from 'next/server';
import { ExecutionService } from '../../../../../../lib/talent/infrastructure/execution/ExecutionService';
import { ApiUtils } from '../../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../../lib/talent/auth/middleware';

const executionService = new ExecutionService();

export async function POST(req: NextRequest) {
  return withAuthorization(req, 'CREATE_EXECUTION', '*', async (req, userContext) => {
    try {
      const body = await req.json();
      const { sessionId, language, code } = body;

      if (!sessionId || !language || !code) {
        return ApiUtils.badRequest('sessionId, language, and code are required');
      }

      const job = await executionService.submitExecution(sessionId, language, code);

      return ApiUtils.success(job, undefined, 201);
    } catch (error: any) {
      return ApiUtils.error('Failed to submit execution job', 500, error);
    }
  });
}
