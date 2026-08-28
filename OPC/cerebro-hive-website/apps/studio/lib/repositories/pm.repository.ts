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
      const pmModule = await tx.module.create({
        data: {
          projectId,
          name: title,
          description: body,
        },
      });

      const epic = await tx.feature.create({
        data: {
          moduleId: pmModule.id,
          name: title,
          description: body,
        },
      });

      // Map the checklist into child Tasks
      if (decomposition.checklist && decomposition.checklist.length > 0) {
        const tasksData = decomposition.checklist.map((taskTitle) => ({
          featureId: epic.id,
          title: taskTitle,
        }));

        await tx.task.createMany({
          data: tasksData,
        });
      }

      return epic;
    });
  }

  static async getProjectEpics(projectId: string) {
    return prisma.feature.findMany({
      where: { module: { projectId } },
      include: { tasks: true },
    });
  }
}
