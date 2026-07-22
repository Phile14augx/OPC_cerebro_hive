import { NextRequest } from 'next/server';
import { AssessmentService } from '../../../../../lib/talent/services/AssessmentService';
import { ApiUtils } from '../../../../../lib/talent/utils/api';
import { withAuthorization } from '../../../../../lib/talent/auth/middleware';

const assessmentService = new AssessmentService();

export async function GET(req: NextRequest) {
  return withAuthorization(req, 'READ_ASSESSMENT', '*', async (req: any, userContext: any) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      // In a real app, workspaceId would be derived from the user's active context.
      // Mocking for the prototype:
      const workspaceId = searchParams.get('workspaceId') || 'mock-workspace-id';
      const skip = parseInt(searchParams.get('skip') || '0', 10);
      const take = parseInt(searchParams.get('take') || '10', 10);
      const status = searchParams.get('status') || undefined;

      const result = await assessmentService.listAssessments({ workspaceId, skip, take, status });

      return ApiUtils.success(result.data, { total: result.total, skip, take });
    } catch (error: any) {
      return ApiUtils.error('Failed to list assessments', 500, error);
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuthorization(req, 'CREATE_ASSESSMENT', '*', async (req: any, userContext: any) => {
    try {
      const body = await req.json();
      const { title, workspaceId = 'mock-workspace-id' } = body;

      if (!title) {
        return ApiUtils.badRequest('Title is required');
      }

      // Note: We don't have traceId extraction middleware yet, so we'll let ApiUtils generate it
      // In a full implementation, we'd pull it from a AsyncLocalStorage or context.
      
      const assessment = await assessmentService.createDraft(
        workspaceId,
        title,
        userContext.userId
      );

      return ApiUtils.success(assessment, undefined, 201);
    } catch (error: any) {
      return ApiUtils.error('Failed to create assessment', 500, error);
    }
  });
}
