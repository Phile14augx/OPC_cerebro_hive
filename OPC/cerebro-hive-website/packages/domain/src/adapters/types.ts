// Core domain types for framework-agnostic agent runtime

import { z } from 'zod';

// Agent Configuration
export const AgentConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  framework: z.enum(['langgraph', 'autogen', 'crewai', 'openai-agents', 'semantic-kernel']),
  stateSchema: z.any().optional(),
  memoryKeys: z.array(z.string()).optional(),
  toolIds: z.array(z.string().uuid()).optional(),
  workflowId: z.string().uuid().optional(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// Agent State
export const AgentStateSchema = z.object({
  id: z.string().uuid(),
  step: z.string().optional(),
  context: z.record(z.string(), z.any()).optional(),
  timestamp: z.date().optional(),
});

export type AgentState = z.infer<typeof AgentStateSchema>;

// Execution Result
export const ExecutionResultSchema = z.object({
  agentId: z.string().uuid(),
  success: z.boolean(),
  output: z.any(),
  error: z.string().optional(),
  duration: z.number(),
  traceId: z.string().uuid().optional(),
});

export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

// Execution Parameters
export const ExecutionParamsSchema = z.object({
  agentId: z.string().uuid(),
  input: z.any(),
  options: z.object({
    timeout: z.number().optional(),
    maxSteps: z.number().optional(),
    stream: z.boolean().optional(),
  }).optional(),
});

export type ExecutionParams = z.infer<typeof ExecutionParamsSchema>;

// Framework Adapter Interface
export interface FrameworkAdapter {
  framework: string;
  
  // Agent lifecycle
  createAgent(config: AgentConfig): Promise<AgentState>;
  execute(params: ExecutionParams): Promise<ExecutionResult>;
  stop(agentId: string): Promise<void>;
  getState(agentId: string): Promise<AgentState>;
  
  // Tool management
  registerTool(toolId: string): Promise<void>;
  unregisterTool(toolId: string): Promise<void>;
  
  // Memory integration
  connectMemory(memoryKey: string): Promise<void>;
}

// Adapter Factory
export type AdapterFactory = (config: unknown) => FrameworkAdapter;
