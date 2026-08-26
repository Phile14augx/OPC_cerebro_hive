'use server';

import { PlatformService } from '@/lib/services/platform.service';
import { z } from 'zod';
import { getLocalSession } from './auth';

const workspaceIdSchema = z.string().uuid();

/**
 * Fetch all workspaces for the currently authenticated user's organization.
 */
export async function getWorkspaces() {
  const session = await getLocalSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const workspaces = await PlatformService.getWorkspaces(session.userId);
    return { data: workspaces };
  } catch {
    return { error: 'Failed to fetch workspaces.' };
  }
}

/**
 * Fetch all projects for a specific workspace.
 */
export async function getProjects(workspaceId: string) {
  const parsedWorkspaceId = workspaceIdSchema.safeParse(workspaceId);
  if (!parsedWorkspaceId.success) {
    return { error: 'Invalid workspace.' };
  }

  const session = await getLocalSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const projects = await PlatformService.getProjects(session.userId, parsedWorkspaceId.data);
    return { data: projects };
  } catch {
    return { error: 'Failed to fetch projects.' };
  }
}
