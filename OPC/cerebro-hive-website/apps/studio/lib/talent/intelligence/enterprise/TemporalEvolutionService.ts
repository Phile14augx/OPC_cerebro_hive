// @ts-nocheck
import { prisma, SkillProfileSnapshot } from '@cerebro/db';
import { SkillGraphService } from '../graph/SkillGraphService';

const graphService = new SkillGraphService();

export class TemporalEvolutionService {
  
  /**
   * Materializes the current Skill Graph state into a permanent snapshot.
   * Runs nightly for active candidates/employees.
   */
  async materializeNightlySnapshot(candidateProfileId: string): Promise<SkillProfileSnapshot> {
    console.log(`[Temporal Evolution] Materializing snapshot for ${candidateProfileId}`);
    
    // Aggregate all evidence up to right now
    const currentGraph = await graphService.generateCandidateSkillProfile(candidateProfileId);

    return prisma.skillProfileSnapshot.create({
      data: {
        candidateProfileId,
        snapshotDate: new Date(),
        graphPayload: currentGraph
      }
    });
  }

  /**
   * Retrieves historical snapshots to render trend lines.
   */
  async getSkillTrajectory(candidateProfileId: string, months: number = 12) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    return prisma.skillProfileSnapshot.findMany({
      where: {
        candidateProfileId,
        snapshotDate: { gte: cutoffDate }
      },
      orderBy: { snapshotDate: 'asc' }
    });
  }
}
