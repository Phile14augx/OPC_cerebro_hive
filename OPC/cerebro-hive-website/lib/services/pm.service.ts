import { decomposeEpic } from '@/lib/agents/pm-agent/provider';
import { PmRepository } from '@/lib/repositories/pm.repository';
import { AuditService } from '@/lib/services/audit.service';
import crypto from 'crypto';

export class PmService {
  /**
   * Triggers the PM Agent LLM to decompose an Epic and persists the result.
   */
  static async processEpicDecomposition(
    projectId: string,
    title: string,
    body: string,
    promptTemplate: string,
    userId?: string
  ) {
    const requestId = crypto.randomUUID();

    try {
      // 1. Invoke the PM Agent LLM
      const decomposition = await decomposeEpic(title, body, promptTemplate, requestId);

      // 2. Persist to database via Repository
      const epic = await PmRepository.createEpicFromDecomposition(projectId, title, body, decomposition);

      // 3. Log Audit Event
      await AuditService.log('pm_agent.epic_decomposed', `Epic:${epic.id}`, userId, {
        projectId,
        requestId,
        riskLevel: decomposition.riskLevel,
        storyPoints: decomposition.storyPoints,
      });

      return epic;
    } catch (error) {
      await AuditService.log('pm_agent.epic_decomposition_failed', `Project:${projectId}`, userId, {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  static async getEpics(projectId: string) {
    return PmRepository.getProjectEpics(projectId);
  }
}
