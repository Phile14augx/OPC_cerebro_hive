import { NextRequest } from 'next/server';
import { AssessmentService } from '../../../../../lib/talent/services/AssessmentService';
import { ApiUtils } from '../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../lib/talent/auth/middleware';
import { TalentAuthorizationContext } from '../../../../../lib/talent/auth/policy';

const assessmentService = new AssessmentService();

export async function GET(req: NextRequest) {
  const target = { resourceType: 'workspace', resourceId: req.headers.get('x-workspace-id') || '' };
  return withAuthorization(req, 'READ_ASSESSMENT', 'talent_assessments', async (req, userContext) => {
    try {
      const context = userContext as TalentAuthorizationContext;
      const searchParams = req.nextUrl.searchParams;
      const skip = parseInt(searchParams.get('skip') || '0', 10);
      const take = parseInt(searchParams.get('take') || '10', 10);
      const status = searchParams.get('status') || undefined;

      const result = await assessmentService.listAssessments({ workspaceId: context.workspaceId, skip, take, status });

      return ApiUtils.success(result.data, { total: result.total, skip, take });
    } catch (error: unknown) {
      return ApiUtils.error('Failed to list assessments', 500, error);
    }
  }, target);
}

export async function POST(req: NextRequest) {
  const target = { resourceType: 'workspace', resourceId: req.headers.get('x-workspace-id') || '' };
  return withAuthorization(req, 'CREATE_ASSESSMENT', 'talent_assessments', async (req, userContext) => {
    try {
      const context = userContext as TalentAuthorizationContext;
      const body = await req.json();
      const { title } = body;

      if (!title) {
        return ApiUtils.badRequest('Title is required');
      }

      // Note: We don't have traceId extraction middleware yet, so we'll let ApiUtils generate it
      // In a full implementation, we'd pull it from a AsyncLocalStorage or context.
      
      const assessment = await assessmentService.createDraft(
        context.workspaceId,
        title,
        context.userId
      );

      return ApiUtils.success(assessment, undefined, 201);
    } catch (error: unknown) {
      return ApiUtils.error('Failed to create assessment', 500, error);
    }
  }, target);
}
