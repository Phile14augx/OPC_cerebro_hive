import { ExecutionContext } from '../context/ExecutionContext';

export type CapabilityType = 
  | 'LLMProvider' 
  | 'ToolProvider' 
  | 'MemoryProvider' 
  | 'PolicyProvider' 
  | 'PlannerProvider' 
  | 'AgentProvider'
  | 'StorageProvider'
  | 'EmbeddingProvider'
  | 'SearchProvider'
  | 'EvaluationProvider';

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

export interface LLMProvider extends CapabilityProvider {
  invokeModel(prompt: string, context: ExecutionContext, onToken?: (token: string) => void): Promise<string>;
}

export interface ToolProvider extends CapabilityProvider {
  invokeTool(toolName: string, args: Record<string, any>, context: ExecutionContext): Promise<any>;
  listAvailableTools(context: ExecutionContext): Promise<string[]>;
}

export interface MemoryProvider extends CapabilityProvider {
  store(key: string, value: any, context: ExecutionContext): Promise<void>;
  retrieve(key: string, context: ExecutionContext): Promise<any>;
}

export interface PolicyProvider extends CapabilityProvider {
  evaluate(action: string, resource: string, context: ExecutionContext): Promise<{ allowed: boolean; reason?: string }>;
}

export interface PlannerProvider extends CapabilityProvider {
  createPlan(goal: string, context: ExecutionContext): Promise<string[]>;
}

export interface AgentProvider extends CapabilityProvider {
  executeTask(task: string, context: ExecutionContext): Promise<any>;
}
