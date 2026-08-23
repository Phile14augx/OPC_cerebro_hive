import { describe, it, expect } from 'vitest';
import { GraphExplainabilityService } from '../enterprise/GraphExplainabilityService';
import { SemanticMatchingService } from '../enterprise/SemanticMatchingService';
import { TemporalEvolutionService } from '../enterprise/TemporalEvolutionService';
import { SkillGraphService } from '../graph/SkillGraphService';

describe('Cohort C Schema Debt Regression (W0.2-SUP-FALSE-GREEN)', () => {
  it('GraphExplainabilityService fails closed due to missing SkillEvidence model', async () => {
    const service = new GraphExplainabilityService();
    await expect(service.traceRecommendationEvidence('c1', ['cap1']))
      .rejects.toThrowError('ERR_SCHEMA_MISSING: skillEvidence schema is unavailable.');
  });

  it('SemanticMatchingService fails closed due to missing ProjectSkillRequirement model', async () => {
    const service = new SemanticMatchingService();
    await expect(service.matchCandidatesToProject('p1'))
      .rejects.toThrowError('ERR_SCHEMA_MISSING: projectSkillRequirement schema is unavailable.');
  });

  it('TemporalEvolutionService fails closed due to missing SkillProfileSnapshot model', async () => {
    const service = new TemporalEvolutionService();
    await expect(service.materializeNightlySnapshot('c1'))
      .rejects.toThrowError('ERR_SCHEMA_MISSING: skillEvidence schema is unavailable.');

    await expect(service.getSkillTrajectory('c1'))
      .rejects.toThrowError('ERR_SCHEMA_MISSING: skillProfileSnapshot schema is unavailable.');
  });

  it('SkillGraphService fails closed due to missing models', async () => {
    const service = new SkillGraphService();
    
    // Testing missing SkillEvidence
    await expect(service.recordEvidence('c1', 'SQL', 90, 0.9, 'test', 'sys'))
      .rejects.toThrowError('ERR_SCHEMA_MISSING: skillEvidence schema is unavailable.');

    await expect(service.generateCandidateSkillProfile('c1'))
      .rejects.toThrowError('ERR_SCHEMA_MISSING: skillEvidence schema is unavailable.');
  });

});
