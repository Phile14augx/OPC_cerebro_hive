import { z } from 'zod';
import { ProvenanceSchema } from './provenance';
import { TwinDefinitionSchema } from './twin-definition';

export const ScopeSchema = z.object({ tenantId: z.string().min(1), workspaceId: z.string().min(1) });
export const CreateTwinCommandSchema = ScopeSchema.extend({ name: z.string().min(1), definition: TwinDefinitionSchema });
export const UpdateEntityStateCommandSchema = ScopeSchema.extend({ twinId: z.string().min(1), entityId: z.string().min(1), state: z.record(z.unknown()), provenance: ProvenanceSchema });

export type Scope = z.infer<typeof ScopeSchema>;
export type CreateTwinCommand = z.infer<typeof CreateTwinCommandSchema>;
export type UpdateEntityStateCommand = z.infer<typeof UpdateEntityStateCommandSchema>;
