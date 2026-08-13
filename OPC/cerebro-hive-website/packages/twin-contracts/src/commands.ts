import { z } from 'zod';
import { ProvenanceSchema } from './provenance';
import { TwinDefinitionSchema } from './twin-definition';

export const ScopeSchema = z.object({ tenantId: z.string().min(1), workspaceId: z.string().min(1) });
export const CreateTwinCommandSchema = ScopeSchema.extend({
  name: z.string().trim().min(1).max(160),
  type: z.string().trim().min(1).max(80).default('GENERIC'),
  metadata: z.record(z.string(), z.unknown()).default({}),
  definition: TwinDefinitionSchema,
  createdBy: z.string().trim().min(1).optional(),
});
export const UpdateEntityStateCommandSchema = ScopeSchema.extend({ twinId: z.string().min(1), entityId: z.string().min(1), state: z.record(z.string(), z.unknown()), provenance: ProvenanceSchema });

export const CreateVersionProposalCommandSchema = ScopeSchema.extend({
  twinId: z.string().min(1),
  definition: TwinDefinitionSchema,
  provenance: ProvenanceSchema,
  createdBy: z.string().trim().min(1).optional(),
});

export const ApplyVersionProposalCommandSchema = ScopeSchema.extend({
  twinId: z.string().min(1),
  proposalId: z.string().min(1),
  approved: z.literal(true),
  appliedBy: z.string().trim().min(1).optional(),
});

export const RejectVersionProposalCommandSchema = ScopeSchema.extend({
  twinId: z.string().min(1),
  proposalId: z.string().min(1),
  reason: z.string().trim().min(1).max(500).optional(),
});

export const CreateScenarioCommandSchema = ScopeSchema.extend({
  twinId: z.string().min(1),
  name: z.string().trim().min(1).max(160),
  kind: z.enum(['ENTITY_OUTAGE', 'CAPACITY_CHANGE']),
  inputs: z.record(z.string(), z.unknown()),
  createdBy: z.string().trim().min(1).optional(),
});

export type Scope = z.infer<typeof ScopeSchema>;
export type CreateTwinCommand = z.infer<typeof CreateTwinCommandSchema>;
export type UpdateEntityStateCommand = z.infer<typeof UpdateEntityStateCommandSchema>;
export type CreateVersionProposalCommand = z.infer<typeof CreateVersionProposalCommandSchema>;
export type ApplyVersionProposalCommand = z.infer<typeof ApplyVersionProposalCommandSchema>;
export type RejectVersionProposalCommand = z.infer<typeof RejectVersionProposalCommandSchema>;
export type CreateScenarioCommand = z.infer<typeof CreateScenarioCommandSchema>;
