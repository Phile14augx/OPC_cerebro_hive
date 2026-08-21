
import { StudioGraph } from '../../graph/GraphModel';
import { ExecutionPlan } from '../ir/ExecutionPlan';
import { Diagnostic } from '../CompilerErrors';
import { DataType } from '../types/TypeSystem';

export interface Symbol {
  id: string;
  category: 'variable' | 'node' | 'stage';
  scope: string;
  type: DataType;
  producer: string; 
  consumers: string[];
  nullable: boolean;
  mutable: boolean;
  schema?: unknown; // JSON schema if structured output
}

export interface DebugMetadata {
  sourceNodeId: string;
  executionStageId: string;
  symbolIds: string[];
  sourceLocation: { x: number; y: number };
  breakpointId?: string;
}

export interface CompilationArtifacts {
  symbolTable: Record<string, Symbol>;
  debugMap: Record<string, DebugMetadata>;
  workflowDiff?: unknown;
}

export interface CompilerMetrics {
  compilationTimeMs: number;
  passTimings: Record<string, number>;
  nodeCount: number;
  stageCount: number;
  optimizationCount: number;
}

export interface CompilationContext {
  graph: StudioGraph;
  plan: ExecutionPlan;
  diagnostics: Diagnostic[];
  artifacts: CompilationArtifacts;
  metrics: CompilerMetrics;
}

export interface PassResult {
  context: CompilationContext;
  diagnostics: Diagnostic[];
}

export interface CompilerPass {
  id: string;
  phase: string;
  description: string;
  requires: string[];
  run: (context: Readonly<CompilationContext>) => PassResult;
}
