import { PrismaClient, SkillEvidence } from '@prisma/client';

const prisma = new PrismaClient();

export class SkillGraphService {
  
  /**
   * Translates raw execution scores into Competency Evidence.
   * e.g., if a candidate scores 100 on the "SQL Window Function Widget", 
   * this pushes evidence to the "Advanced SQL" capability with high confidence.
   */
  async recordEvidence(
    candidateProfileId: string, 
    capabilityName: string, 
    score: number, 
    confidence: number, 
    context: string, 
    source: string,
    submissionId?: string
  ): Promise<SkillEvidence> {
    
    // Auto-resolve or create capability via the taxonomy
    const capability = await this.resolveCapability(capabilityName);

    return prisma.skillEvidence.create({
      data: {
        capabilityId: capability.id,
        candidateProfileId,
        submissionId,
        score,
        confidence,
        context,
        source
      }
    });
  }

  /**
   * Aggregates all evidence for a candidate to generate a current Skill Profile.
   * Uses weighted averages based on the `confidence` score of each evidence point.
   */
  async generateCandidateSkillProfile(candidateProfileId: string) {
    const evidences = await prisma.skillEvidence.findMany({
      where: { candidateProfileId },
      include: { capability: { include: { competency: { include: { domain: true } } } } }
    });

    const graph: Record<string, any> = {};

    evidences.forEach(ev => {
      const dom = ev.capability.competency.domain.name;
      const comp = ev.capability.competency.name;
      const cap = ev.capability.name;

      if (!graph[dom]) graph[dom] = {};
      if (!graph[dom][comp]) graph[dom][comp] = {};
      if (!graph[dom][comp][cap]) graph[dom][comp][cap] = { totalScore: 0, weight: 0, evidences: [] };

      const weightedScore = ev.score * ev.confidence;
      graph[dom][comp][cap].totalScore += weightedScore;
      graph[dom][comp][cap].weight += ev.confidence;
      graph[dom][comp][cap].evidences.push({ score: ev.score, context: ev.context, source: ev.source });
    });

    // Normalize scores
    for (const dom in graph) {
      for (const comp in graph[dom]) {
        for (const cap in graph[dom][comp]) {
          const node = graph[dom][comp][cap];
          node.finalScore = node.weight > 0 ? (node.totalScore / node.weight).toFixed(1) : 0;
        }
      }
    }

    return graph;
  }

  private async resolveCapability(capabilityName: string) {
    // In production, this looks up the standard Taxonomy. For the prototype, we mock the lookup.
    let cap = await prisma.skillCapability.findFirst({ where: { name: capabilityName } });
    if (!cap) {
      // Mock creation for prototyping seamlessly
      const dom = await prisma.skillDomain.upsert({
        where: { name: "Software Engineering" },
        update: {}, create: { name: "Software Engineering" }
      });
      const comp = await prisma.skillCompetency.upsert({
        where: { domainId_name: { domainId: dom.id, name: "General Programming" } },
        update: {}, create: { domainId: dom.id, name: "General Programming" }
      });
      cap = await prisma.skillCapability.create({
        data: { competencyId: comp.id, name: capabilityName }
      });
    }
    return cap;
  }
}
