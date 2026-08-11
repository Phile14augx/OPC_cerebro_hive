/**
 * Canonical schemas for the CerebroHive Agent Engineering Platform.
 * These definitions represent the source-of-truth structures exchanged across
 * the Runtime, Execution Providers (LangGraph/AutoGen), Registry, and Studio.
 */

export interface CapabilityDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'planner' | 'retriever' | 'tool' | 'memory' | 'model' | 'evaluator';
  provider: string; // e.g. "openai", "langgraph", "native"
  metadata?: Record<string, any>;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  schema: Record<string, any>; // JSON schema of tool arguments
  capabilityRef?: string; // Reference to a specific capability
}

export interface MemoryDefinition {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'knowledge_graph' | 'vector';
  ttl?: number; // Time to live (ephemeral or persistent if undefined)
  schema?: Record<string, any>;
}

export interface NodeDefinition {
  id: string;
  type: 'agent' | 'tool' | 'router' | 'memory' | 'evaluator' | 'custom';
  name: string;
  capabilities: CapabilityDefinition[];
  configuration?: Record<string, any>;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: NodeDefinition[];
  tools: ToolDefinition[];
  memory: MemoryDefinition[];
  entrypoint: string; // The ID of the starting NodeDefinition
}
