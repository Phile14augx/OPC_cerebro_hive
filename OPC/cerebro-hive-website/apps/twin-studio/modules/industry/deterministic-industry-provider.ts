import {
  IndustryModelProposalSchema,
  TwinDefinitionSchema,
  type IndustryBrief,
  type IndustryModelProposal,
  type TwinDefinition,
} from '@cerebro/twin-contracts';
import { evaluateTwinDefinitionPolicy } from '../twin-definition/twin-policy';
import { domainVocabulary, genericDefinition, inferIndustry } from './domain-vocabulary';
import type { IndustryModelProvider } from './industry-model-provider';

function cloneDefinition(definition: TwinDefinition): TwinDefinition {
  return TwinDefinitionSchema.parse(structuredClone(definition));
}

export class DeterministicIndustryProvider implements IndustryModelProvider {
  generate(brief: IndustryBrief): IndustryModelProposal {
    const industry = inferIndustry(brief.brief, brief.industry);
    const pack = industry === 'generic' ? undefined : domainVocabulary[industry];
    const definition = pack ? cloneDefinition(pack.definition) : genericDefinition(brief.brief);
    const policy = evaluateTwinDefinitionPolicy(definition);
    if (!policy.allowed) {
      throw new Error('POLICY_REJECTED');
    }
    const now = new Date();
    return IndustryModelProposalSchema.parse({
      industry,
      title: brief.name?.trim() || pack?.title || 'Generated twin',
      definition,
      provenance: {
        source: 'deterministic-industry-provider',
        classification: 'INFERRED',
        observedAt: now,
        effectiveAt: now,
        ingestedAt: now,
        confidence: pack ? 0.86 : 0.55,
        quality: 1,
        evidenceIds: [`industry:${industry}`],
      },
      schemaValid: true,
      policyValid: true,
      previewOnly: true,
    });
  }
}

export const industryModelProvider = new DeterministicIndustryProvider();
