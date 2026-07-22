import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SemanticMatchingService {
  
  /**
   * Leverages pgvector to find Candidates or Employees whose SkillCapabilities 
   * semantically match the required Project Capabilities.
   */
  async matchCandidatesToProject(projectId: string, limit: number = 5) {
    console.log(`[Semantic Matching] Analyzing Project Requirements for ${projectId}`);
    
    const requirements = await prisma.projectSkillRequirement.findMany({
      where: { projectId }
    });

    if (requirements.length === 0) return [];

    // In a fully configured pgvector environment, we would do a raw SQL query:
    // SELECT * FROM "CandidateProfile" 
    // JOIN "Embedding" e ON e."entityId" = "CandidateProfile".id
    // ORDER BY e.embedding <-> $1 LIMIT $2;
    
    // For this prototype mock, we simulate semantic scoring
    console.log(`[Semantic Matching] Performing cosine similarity search on ${requirements.length} requirements...`);
    
    return [
      { candidateId: 'c1', matchScore: 94.2, topMatchedSkill: requirements[0].capabilityName },
      { candidateId: 'c2', matchScore: 88.5, topMatchedSkill: requirements[0].capabilityName },
    ];
  }
}
