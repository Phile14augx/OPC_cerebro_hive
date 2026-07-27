
import { Diagnostic } from '../CompilerErrors';

export interface DataSchema {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  collection: boolean;
}

export interface Resource {
  id: string;
  type: string;
  provider: string;
  identifier: string;
  quantity: number;
  estimatedCost: number;
}

export interface Stage {
  id: string;
  level: number;
  parallel: boolean;
  nodes: string[]; // Node IDs executed in this stage
  inputs: DataSchema[];
  outputs: DataSchema[];
  estimatedDurationMs: number;
  estimatedCost: number;
}

export interface StageDependency {
  sourceStage: string;
  targetStage: string;
  type: 'Data' | 'Control' | 'Event' | 'Approval';
}

export interface ExecutionPlan {
  version: string;
  workflowId: string;
  executionMode: 'simulation' | 'production';
  graph: any; // The original optimized StudioGraph
  stages: Stage[];
  dependencies: StageDependency[];
  resources: Resource[];
  estimates: {
    totalDurationMs: number;
    totalCost: number;
  };
  diagnostics: Diagnostic[];
}
