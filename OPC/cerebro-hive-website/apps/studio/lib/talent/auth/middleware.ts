import { NextRequest } from 'next/server';
import { ApiUtils } from '../utils/api';
import { AuthService } from '@/lib/services/auth.service';
import { TalentPolicyEngine } from './policy';
import { prisma } from '@/lib/prisma';
import { TALENT_PERMISSION_TUPLES, TalentAuthorizationRepository } from '@cerebro/db';

export async function withAuthorization(
  req: NextRequest,
  key: string,
  resource: string,
  handler: (req: NextRequest, userContext: unknown) => Promise<Response>,
  target?: { resourceType: string; resourceId: string }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookie = req.headers.get('cookie');
    let token = '';

    if (authHeader) {
      if (authHeader === 'Bearer' || !authHeader.startsWith('Bearer ')) {
        return ApiUtils.error('Unauthorized', 401);
      }
      token = authHeader.substring(7);
    } else if (cookie && cookie.includes('access_token=')) {
      token = cookie.split('access_token=')[1].split(';')[0];
      
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        const origin = req.headers.get('origin') || req.headers.get('referer');
        if (!origin) return ApiUtils.error('Forbidden', 403);
        try {
          const originUrl = new URL(origin);
          const reqUrl = new URL(req.url);
          if (originUrl.protocol !== reqUrl.protocol || originUrl.hostname !== reqUrl.hostname || originUrl.port !== reqUrl.port) {
            return ApiUtils.error('Forbidden', 403);
          }
        } catch {
          return ApiUtils.error('Forbidden', 403);
        }
      }
    } else {
      return ApiUtils.error('Unauthorized', 401);
    }

    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) {
      return ApiUtils.error('Bad Request: Missing workspace selector', 400);
    }

    if (!target || !target.resourceType || !target.resourceId || resource === '*' || key === '') {
      return ApiUtils.error('Forbidden', 403);
    }

    const user = await AuthService.verifyToken(token);
    if (!user || !user.userId) return ApiUtils.error('Unauthorized', 401);

    const repo = TalentAuthorizationRepository.fromPrisma(prisma);
    let resolvedTarget = null;
    
    try {
      if (target.resourceType === 'workspace') {
        resolvedTarget = await repo.resolveWorkspaceTarget(target.resourceId);
      } else if (target.resourceType === 'project') {
        resolvedTarget = await repo.resolveProjectTarget(target.resourceId, workspaceId);
      } else if (target.resourceType === 'assessment_version') {
        resolvedTarget = await repo.resolveAssessmentVersionTarget(target.resourceId, workspaceId);
      } else if (target.resourceType === 'session') {
        resolvedTarget = await repo.resolveSessionTarget(target.resourceId, workspaceId);
      }
    } catch {
      return ApiUtils.error('Forbidden', 403);
    }

    if (!resolvedTarget || resolvedTarget.workspaceId !== workspaceId) {
      return ApiUtils.error('Forbidden', 403);
    }

    const tuple = TALENT_PERMISSION_TUPLES.find(t => t.key === key && t.resource === resource);
    if (!tuple) {
      return ApiUtils.error('Forbidden', 403);
    }

    const policy = new TalentPolicyEngine();
    const context = await policy.authorize(user.userId, resolvedTarget, tuple);

    if (!context) {
      return ApiUtils.error('Forbidden', 403);
    }

    return await handler(req, context);
  } catch (error: unknown) {
    return ApiUtils.error('Internal Server Error', 500, error);
  }
}
