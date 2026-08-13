import { z } from 'zod';

export const ProvenanceClassificationSchema = z.enum(['OBSERVED', 'INFERRED', 'PREDICTED', 'SIMULATED']);

export const ProvenanceSchema = z.object({
  source: z.string().min(1),
  classification: ProvenanceClassificationSchema,
  observedAt: z.coerce.date(),
  effectiveAt: z.coerce.date(),
  ingestedAt: z.coerce.date(),
  confidence: z.number().min(0).max(1).optional(),
  quality: z.number().min(0).max(1).optional(),
  evidenceIds: z.array(z.string().min(1)).default([]),
});

export type Provenance = z.infer<typeof ProvenanceSchema>;
