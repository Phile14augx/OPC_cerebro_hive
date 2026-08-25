

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
   * For unknown AI Recommendation generated, this API exposes the exact provenance 
   * of the data used to make that recommendation. Crucial for Enterprise compliance.
   */
  async traceRecommendationEvidence(candidateProfileId: string, capabilityIds: string[]): Promise<ExplainabilityTrace> {
    console.log(`[Explainability] Tracing evidence for candidate ${candidateProfileId} on capabilities ${capabilityIds.join(', ')}`);
    
    // BUG FIX (W0.2-SUP-127/128): prisma.skillEvidence is missing from DB schema
    throw new Error("ERR_SCHEMA_MISSING: skillEvidence schema is unavailable.");
  }
}
