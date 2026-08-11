import { z } from 'zod';
import { ProvenanceSchema } from './provenance';
import { TwinDefinitionSchema } from './twin-definition';

export const IndustryBriefSchema = z.object({ domain: z.string().min(2), description: z.string().min(10), scale: z.record(z.number().nonnegative()).optional(), goals: z.array(z.string().min(2)).default([]) });
export const IndustryModelProposalSchema = z.object({
  id: z.string().min(1), domain: z.string().min(2), status: z.literal('PREVIEW'), definition: TwinDefinitionSchema,
  suggestedEntities: z.array(z.object({ typeKey: z.string().min(1), name: z.string().min(1), count: z.number().int().positive() })),
  alerts: z.array(z.object({ key: z.string().min(1), description: z.string().min(1), severity: z.enum(['INFO', 'WARNING', 'CRITICAL']) })),
  provenance: ProvenanceSchema, warnings: z.array(z.string()).default([]),
});
export type IndustryBrief = z.input<typeof IndustryBriefSchema>;
export type IndustryModelProposal = z.infer<typeof IndustryModelProposalSchema>;
