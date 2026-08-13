import { z } from 'zod';
import { ProvenanceSchema } from './provenance';
import { TwinDefinitionSchema } from './twin-definition';

export const IndustryKeySchema = z.enum([
  'manufacturing',
  'airport',
  'hospital',
  'banking',
  'supply-chain',
  'building',
  'energy-grid',
  'data-center',
  'generic',
]);

export const IndustryBriefSchema = z.object({
  brief: z.string().trim().min(8).max(2_000),
  industry: IndustryKeySchema.optional(),
  name: z.string().trim().min(2).max(160).optional(),
});

export const IndustryModelProposalSchema = z.object({
  industry: IndustryKeySchema,
  title: z.string().min(1).max(160),
  definition: TwinDefinitionSchema,
  provenance: ProvenanceSchema,
  schemaValid: z.literal(true),
  policyValid: z.literal(true),
  previewOnly: z.literal(true),
});

export type IndustryKey = z.infer<typeof IndustryKeySchema>;
export type IndustryBrief = z.infer<typeof IndustryBriefSchema>;
export type IndustryModelProposal = z.infer<typeof IndustryModelProposalSchema>;
