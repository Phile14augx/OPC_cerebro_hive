import { z } from 'zod';

export const AgentEventSchema = z.object({
  eventId: z.string().uuid(),
  agentId: z.string().uuid(),
  timestamp: z.string().datetime(),
  type: z.enum(['AGENT_STARTED', 'AGENT_PAUSED', 'AGENT_STOPPED', 'TOOL_EXECUTED']),
  payload: z.record(z.any()).optional(),
});

export type AgentEvent = z.infer<typeof AgentEventSchema>;
