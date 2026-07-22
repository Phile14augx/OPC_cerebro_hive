import { z } from 'zod';

export const WorkflowExecutionEventSchema = z.object({
  executionId: z.string().uuid(),
  pipelineId: z.string().uuid(),
  timestamp: z.string().datetime(),
  status: z.enum(['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED']),
  nodeId: z.string().optional(),
  error: z.string().optional(),
});

export type WorkflowExecutionEvent = z.infer<typeof WorkflowExecutionEventSchema>;
