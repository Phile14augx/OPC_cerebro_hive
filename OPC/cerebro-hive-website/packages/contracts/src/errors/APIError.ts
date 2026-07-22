import { z } from 'zod';

export const APIErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  traceId: z.string().optional()
});

export type APIError = z.infer<typeof APIErrorSchema>;
