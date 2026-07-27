
import { StudioGraph } from '../../graph/GraphModel';
import { CacheSnapshot } from '../compiler/cache/CompilationCache';
import { CompilationArtifacts, Diagnostic } from '../compiler/engine/CompilationContext';

export type LifecycleState = 'Draft' | 'Published' | 'Deprecated';
export type CompatibilityLevel = 'Patch' | 'Minor' | 'Major';

export interface WorkflowDiff {
  nodesAdded: string[];
  nodesRemoved: string[];
  edgesModified: string[];
  typeSignaturesChanged: string[];
  downstreamImpact: string[];
}

export interface CompatibilityReport {
  level: CompatibilityLevel;
  breakingChanges: string[];
  warnings: string[];
}

export interface WorkflowVersion {
  versionId: string;
  workflowId: string;
  parentVersionId?: string;
  state: LifecycleState;
  
  // Immutable Artifacts Snapshot
  graph: StudioGraph;
  compilationSnapshot: CacheSnapshot;
  artifacts: CompilationArtifacts;
  diagnostics: Diagnostic[];
  diffFromParent?: WorkflowDiff;
  compatibilityReport?: CompatibilityReport;
  
  publishedAt?: string;
}
