import { ExecutionContext } from '../context/ExecutionContext';
import { Goal } from '../planning/Goal';
import { CapabilityType } from './types';
export type { CapabilityType };
import type { ExecutionPlan } from '../planning/ExecutionPlan';

export interface CapabilityProvider {
  /**
   * Initializes the provider if it requires startup logic.
   * Can be called lazily by the CapabilityDescriptor.
   */
  initialize?(): Promise<void>;
  
  /**
   * Disposes of any resources held by the provider.
   */
  dispose?(): Promise<void>;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: LLMToolCall[];
  toolCallId?: string;
}

/** Provider-agnostic tool definition passed to LLM providers. */
export interface LLMToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

/** A tool call returned by the model. */
export interface LLMToolCall {
  id: string;
  name: string;
  arguments: string;
}

/** Result from invokeModelWithTools — carries content and optional tool calls. */
export interface LLMInvocationResult {
  content: string;
  toolCalls?: LLMToolCall[];
  finishReason?: 'stop' | 'tool_use' | 'max_tokens';
}

export interface LLMProvider extends CapabilityProvider {
  /** Basic invocation — returns content string only. */
  invokeModel(messages: LLMMessage[], context: ExecutionContext, onToken?: (token: string) => void): Promise<string>;

  /**
   * Extended invocation with tool support. Optional — if not implemented,
   * the runtime falls back to invokeModel() (no tool calling).
   * When implemented, this method receives tool definitions and returns
   * a richer result that may include tool calls from the model.
   */
  invokeModelWithTools?(
    messages: LLMMessage[],
    tools: LLMToolDefinition[],
    context: ExecutionContext,
  ): Promise<LLMInvocationResult>;
}

export interface ToolProvider extends CapabilityProvider {
  invokeTool(toolName: string, args: Record<string, unknown>, context: ExecutionContext): Promise<unknown>;
  listAvailableTools(context: ExecutionContext): Promise<string[]>;
}

export interface MemoryProvider extends CapabilityProvider {
  store(key: string, value: unknown, context: ExecutionContext): Promise<void>;
  retrieve(key: string, context: ExecutionContext): Promise<unknown>;
}

export interface PolicyProvider extends CapabilityProvider {
  evaluate(action: string, resource: string, context: ExecutionContext): Promise<{ allowed: boolean; reason?: string }>;
}

export interface EvaluationProvider extends CapabilityProvider {
  evaluatePlans(plans: ExecutionPlan[], goal: Goal, context: ExecutionContext, policy: import('../planning/EvaluationPolicy').EvaluationPolicy): Promise<import('../planning/types').ScoredPlan[]>;
}

export interface PlannerProvider extends CapabilityProvider {
  createPlan(goal: Goal, context: ExecutionContext): Promise<ExecutionPlan>;
}

export interface AgentProvider extends CapabilityProvider {
  executeTask(task: string, context: ExecutionContext): Promise<unknown>;
}
