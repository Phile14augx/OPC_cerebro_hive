import { z } from 'zod';
import { ProvenanceSchema } from './provenance';

export const EntityStateUpdatedSchema = z.object({ twinId: z.string().min(1), entityId: z.string().min(1), state: z.record(z.unknown()), provenance: ProvenanceSchema, occurredAt: z.coerce.date() });
export type EntityStateUpdated = z.infer<typeof EntityStateUpdatedSchema>;
