import { NextRequest } from 'next/server';
import { ApiUtils } from '../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../lib/talent/auth/middleware';
import { WorkforceCopilotService } from '../../../../../lib/talent/intelligence/enterprise/WorkforceCopilotService';

const copilotService = new WorkforceCopilotService();

export async function GET(req: NextRequest) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars -- ARCH-LINT: Deferred
  return withAuthorization(req, 'READ_COPILOT_INSIGHTS', '*', async (req: any, userContext: any) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      // Provide a mock project/role ID or take from query
      const projectId = searchParams.get('projectId') || 'mock-role-id';

      // 1. Ask Copilot for recommendations based on execution evidence in the Skill Graph
      const recommendations = await copilotService.recommendCandidatesForProject(projectId, 5);

      return ApiUtils.success(recommendations);
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    } catch (error: any) {
      return ApiUtils.error('Failed to retrieve copilot insights', 500, error);
    }
  });
}
