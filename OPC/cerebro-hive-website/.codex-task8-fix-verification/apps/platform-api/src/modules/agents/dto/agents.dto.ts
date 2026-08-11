import { Type } from '@sinclair/typebox';

export const PublishAgentDto = Type.Object({
  modelId: Type.String(),
  instructions: Type.String(),
  tools: Type.Array(Type.Any()),
});

export const AgentResponseDto = Type.Object({
  agentId: Type.String(),
  version: Type.Number(),
  status: Type.String(),
});
