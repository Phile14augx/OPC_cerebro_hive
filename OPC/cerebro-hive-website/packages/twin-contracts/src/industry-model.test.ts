import { describe, expect, it } from 'vitest';
import { IndustryBriefSchema, IndustryModelProposalSchema } from './industry-model';
import { TwinDefinitionSchema } from './twin-definition';

describe('industry model contracts', () => {
  it('requires a domain brief before generation', () => {
    expect(() => IndustryBriefSchema.parse({ brief: 'short' })).toThrow();
  });

  it('accepts airport and banking briefs as distinct inputs', () => {
    expect(IndustryBriefSchema.parse({ brief: 'Airport gate turnaround for flight 441' }).brief).toMatch(/Airport/);
    expect(IndustryBriefSchema.parse({ brief: 'Retail bank branch with ATM cash levels' }).brief).toMatch(/bank/i);
  });

  it('marks generated proposals as preview-only after TDL validation', () => {
    const definition = TwinDefinitionSchema.parse({
      entityTypes: [{ key: 'gate', name: 'Gate' }],
      relationshipTypes: [],
      variables: [{ key: 'turnaround-minutes', unit: 'min' }],
      rules: [{ key: 'delay', expression: 'turnaround-minutes > 55' }],
      entities: [{ key: 'gate-b12', name: 'Gate B12', typeKey: 'gate', attributes: {} }],
    });
    const now = new Date();
    const proposal = IndustryModelProposalSchema.parse({
      industry: 'airport',
      title: 'Airport operations',
      definition,
      provenance: {
        source: 'test',
        classification: 'INFERRED',
        observedAt: now,
        effectiveAt: now,
        ingestedAt: now,
        evidenceIds: ['industry:airport'],
      },
      schemaValid: true,
      policyValid: true,
      previewOnly: true,
    });
    expect(proposal.previewOnly).toBe(true);
  });
});
