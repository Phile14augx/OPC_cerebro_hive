import { prisma } from '@/lib/prisma';
import { EpicDecomposition } from '@/lib/agents/pm-agent/schema';

export class PmRepository {
  /**
   * Persists an Epic and its corresponding Tasks derived from the PM Agent's decomposition.
   */
  static async createEpicFromDecomposition(
    projectId: string,
    title: string,
    body: string,
    decomposition: EpicDecomposition
  ) {
    // We use a Prisma transaction to ensure the Epic and all Tasks are created atomically.
    return prisma.$transaction(async (tx) => {
      const epic = await tx.epic.create({
        data: {
          projectId,
          title,
          description: body,
          riskLevel: decomposition.riskLevel,
          storyPoints: decomposition.storyPoints,
        },
      });

      // Map the checklist into child Tasks
      if (decomposition.checklist && decomposition.checklist.length > 0) {
        const tasksData = decomposition.checklist.map((taskTitle) => ({
          projectId,
          epicId: epic.id,
          title: taskTitle,
          labels: decomposition.labels || [],
        }));

        await tx.task.createMany({
          data: tasksData,
        });
      }

      return epic;
    });
  }

  static async getProjectEpics(projectId: string) {
    return prisma.epic.findMany({
      where: { projectId },
      include: { tasks: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
