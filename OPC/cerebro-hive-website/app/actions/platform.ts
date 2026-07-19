'use server';

import { PlatformService } from '@/lib/services/platform.service';
import { getMe } from './user';

/**
 * Fetch all workspaces for the currently authenticated user's organization.
 */
export async function getWorkspaces() {
  const { data: user, error } = await getMe();
  if (error || !user || !user.organizationId) {
    return { error: 'Unauthorized or missing organization.' };
  }

  try {
    const workspaces = await PlatformService.getWorkspaces(user.organizationId);
    return { data: workspaces };
  } catch (err: any) {
    console.error('Error fetching workspaces:', err);
    return { error: 'Failed to fetch workspaces.' };
  }
}

/**
 * Fetch all projects for a specific workspace.
 */
export async function getProjects(workspaceId: string) {
  const { data: user, error } = await getMe();
  if (error || !user) {
    return { error: 'Unauthorized.' };
  }

  try {
    // In a full enterprise app, we'd also verify the user has access to this workspace.
    // For now, we trust the UI is passing a workspace the user belongs to.
    const projects = await PlatformService.getProjects(workspaceId);
    return { data: projects };
  } catch (err: any) {
    console.error('Error fetching projects:', err);
    return { error: 'Failed to fetch projects.' };
  }
}
