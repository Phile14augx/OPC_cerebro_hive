const fs = require('fs');
const path = require('path');

const studioDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'apps', 'platform', 'src', 'features', 'studio');
const lifecycleDir = path.join(studioDir, 'lifecycle');
const migrationDir = path.join(studioDir, 'migration');
const engineDir = path.join(studioDir, 'compiler', 'engine');
const passesDir = path.join(studioDir, 'compiler', 'passes');

[lifecycleDir, migrationDir, passesDir, engineDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ----------------------------------------------------
// 1. WORKFLOW LIFECYCLE & PERSISTENCE
// ----------------------------------------------------
fs.writeFileSync(path.join(lifecycleDir, 'WorkflowVersion.ts'), `
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
`);

// ----------------------------------------------------
// 2. MIGRATION ENGINE
// ----------------------------------------------------
fs.writeFileSync(path.join(migrationDir, 'MigrationEngine.ts'), `
import { StudioGraph } from '../../graph/GraphModel';

export interface MigrationStep {
  fromVersion: string;
  toVersion: string;
}

export interface MigrationProvider {
  nodeType: string;
  canAutoMigrate: (node: any, step: MigrationStep) => boolean;
  apply: (node: any, step: MigrationStep) => any;
}

export class MigrationEngine {
  private providers: Map<string, MigrationProvider> = new Map();

  public registerProvider(provider: MigrationProvider) {
    this.providers.set(provider.nodeType, provider);
  }

  public migrate(graph: StudioGraph, targetVersion: string): { migratedGraph: StudioGraph, diagnostics: string[] } {
    const diagnostics: string[] = [];
    const migratedNodes = graph.nodes.map(node => {
      const provider = this.providers.get(node.type);
      if (!provider) return node;

      const step: MigrationStep = { fromVersion: graph.version || 'v1', toVersion: targetVersion };
      
      if (provider.canAutoMigrate(node, step)) {
        diagnostics.push(\`Auto-migrated node \${node.id} (\${node.type})\`);
        return provider.apply(node, step);
      } else {
        diagnostics.push(\`Manual migration required for node \${node.id} (\${node.type})\`);
        return { ...node, hasMigrationError: true }; // Flags for UI rendering
      }
    });

    return {
      migratedGraph: { ...graph, nodes: migratedNodes, version: targetVersion },
      diagnostics
    };
  }
}
`);

// ----------------------------------------------------
// 3. SEMANTIC DIFF ENGINE & COMPATIBILITY ANALYZER
// ----------------------------------------------------
fs.writeFileSync(path.join(engineDir, 'SemanticDiffEngine.ts'), `
import { WorkflowVersion, WorkflowDiff } from '../lifecycle/WorkflowVersion';
import { CompilationArtifacts } from './CompilationContext';
import { DependencyGraph } from '../cache/DependencyGraph';

export class SemanticDiffEngine {
  
  static computeDiff(v1: WorkflowVersion, v2: WorkflowVersion, v2DepGraph: DependencyGraph): WorkflowDiff {
    const nodes1 = new Set(v1.graph.nodes.map(n => n.id));
    const nodes2 = new Set(v2.graph.nodes.map(n => n.id));

    const nodesAdded = Array.from(nodes2).filter(n => !nodes1.has(n));
    const nodesRemoved = Array.from(nodes1).filter(n => !nodes2.has(n));
    
    // Compute downstream impact for removed/modified nodes
    const downstreamImpact = new Set<string>();
    nodesRemoved.forEach(id => {
       // Since the node is removed in v2, we'd normally use v1's dep graph, 
       // but for simplicity we simulate impact gathering here.
       downstreamImpact.add(\`Downstream of \${id}\`);
    });

    return {
      nodesAdded,
      nodesRemoved,
      edgesModified: [],
      typeSignaturesChanged: [],
      downstreamImpact: Array.from(downstreamImpact)
    };
  }
}
`);

fs.writeFileSync(path.join(passesDir, 'CompatibilityAnalyzerPass.ts'), `
import { CompilerPass, PassResult, CompilationContext } from '../engine/CompilationContext';

export const CompatibilityAnalyzerPass: CompilerPass = {
  id: 'core.compatibilityAnalyzer',
  phase: 'policy',
  description: 'Analyzes breaking changes against the parent workflow version',
  requires: ['core.semanticValidation'],
  run: (context: Readonly<CompilationContext>): PassResult => {
    const diagnostics = [];
    
    // MOCK: In reality, we'd compare the context.artifacts.symbolTable against the parent's table.
    // If an InputPort changed from Optional to Required, emit a Major Breaking Change diagnostic.
    
    const hasBreakingChange = false; // Mock
    
    if (hasBreakingChange) {
      diagnostics.push({
        level: 'Error',
        message: 'Major Version Bump Required: Input Port "Document" changed from Optional to Required.'
      });
    }

    return {
      context,
      diagnostics
    };
  }
};
`);

// Add the WorkflowDiff to CompilationArtifacts interface in CompilationContext.ts
const contextPath = path.join(engineDir, 'CompilationContext.ts');
if (fs.existsSync(contextPath)) {
  let contextContent = fs.readFileSync(contextPath, 'utf8');
  if (!contextContent.includes('workflowDiff?: any;')) {
    contextContent = contextContent.replace(
      'debugMap: Record<string, DebugMetadata>;',
      'debugMap: Record<string, DebugMetadata>;\n  workflowDiff?: any;'
    );
    fs.writeFileSync(contextPath, contextContent);
  }
}

console.log('Milestone 25 Versioning Framework Scaffolded Successfully');
