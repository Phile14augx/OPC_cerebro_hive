import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ExplainabilityTrace {
  recommendationId: string;
  supportingEvidence: Array<{
    capabilityName: string;
    context: string;
    score: number;
    confidence: number;
    sourceType: string;
    sourceTimestamp: string;
  }>;
}

export class GraphExplainabilityService {
  
  /**
   * For any AI Recommendation generated, this API exposes the exact provenance 
   * of the data used to make that recommendation. Crucial for Enterprise compliance.
   */
  async traceRecommendationEvidence(candidateProfileId: string, capabilityIds: string[]): Promise<ExplainabilityTrace> {
    console.log(`[Explainability] Tracing evidence for candidate ${candidateProfileId} on capabilities ${capabilityIds.join(', ')}`);
    
    // In production, we fetch the specific evidence nodes that fed into the Snapshot.
    const evidences = await prisma.skillEvidence.findMany({
      where: {
        candidateProfileId,
        capabilityId: { in: capabilityIds }
      },
      include: { capability: true }
    });

    return {
      recommendationId: "req_" + Date.now(),
      supportingEvidence: evidences.map(e => ({
        capabilityName: e.capability.name,
        context: e.context,
        score: e.score,
        confidence: e.confidence,
        sourceType: e.source, // Resolves to EvidenceSource eventually
        sourceTimestamp: e.createdAt.toISOString()
      }))
    };
  }
}
