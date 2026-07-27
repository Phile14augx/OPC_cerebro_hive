const fs = require('fs');
const path = require('path');

const studioDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'apps', 'platform', 'src', 'features', 'studio');
const typesDir = path.join(studioDir, 'compiler', 'types');
const engineDir = path.join(studioDir, 'compiler', 'engine');
const cacheDir = path.join(studioDir, 'compiler', 'cache');

[typesDir, engineDir, cacheDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ----------------------------------------------------
// 1. M23.1: DECLARATIVE TYPE REGISTRY & SKELETONS
// ----------------------------------------------------
fs.writeFileSync(path.join(typesDir, 'TypeSystem.ts'), `
export type TypeCategory = 'Primitive' | 'Structured' | 'AI' | 'Collection' | 'Generic' | 'Union' | 'Unknown';

export interface DataType {
  id: string;
  name: string;
  category: TypeCategory;
}

// Skeletons for Future Expansion
export interface GenericType extends DataType {
  category: 'Generic';
  baseType: DataType;
  typeArguments: DataType[];
}

export interface UnionType extends DataType {
  category: 'Union';
  memberTypes: DataType[];
}

// Built-in Types (abridged)
export const Types = {
  String: { id: 'primitive.string', name: 'String', category: 'Primitive' } as DataType,
  JSON: { id: 'structured.json', name: 'JSON', category: 'Structured' } as DataType,
  Document: { id: 'ai.document', name: 'Document', category: 'AI' } as DataType,
  Unknown: { id: 'sys.unknown', name: 'Unknown', category: 'Unknown' } as DataType
};

// Declarative Compatibility Registry
export type CompatibilityResult = 'Compatible' | 'Implicit' | 'Explicit' | 'Invalid';

export interface CompatibilityRule {
  sourceType: string;
  targetType: string;
  compatibilityKind: CompatibilityResult;
  diagnosticHint?: string;
}

export class TypeRegistry {
  private static rules: CompatibilityRule[] = [];

  static registerRule(rule: CompatibilityRule) {
    this.rules.push(rule);
  }

  static checkCompatibility(source: DataType, target: DataType): CompatibilityResult {
    if (source.id === target.id) return 'Compatible';
    if (source.id === 'sys.unknown' || target.id === 'sys.unknown') return 'Implicit';

    const rule = this.rules.find(r => r.sourceType === source.id && r.targetType === target.id);
    if (rule) return rule.compatibilityKind;
    
    return 'Invalid'; // Default to strict safety
  }
}

// Register default rules
TypeRegistry.registerRule({ sourceType: 'primitive.string', targetType: 'ai.document', compatibilityKind: 'Implicit', diagnosticHint: 'Implicit safe conversion applied.' });
`);

// ----------------------------------------------------
// 2. M24: COMPILATION CACHE & DEPENDENCY GRAPH
// ----------------------------------------------------
fs.writeFileSync(path.join(cacheDir, 'DependencyGraph.ts'), `
export interface DependencyNode {
  nodeId: string;
  upstreamIds: string[];
  downstreamIds: string[];
}

export class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map();

  public buildFromEdges(edges: { source: string; target: string }[]) {
    this.nodes.clear();
    edges.forEach(edge => {
      if (!this.nodes.has(edge.source)) this.nodes.set(edge.source, { nodeId: edge.source, upstreamIds: [], downstreamIds: [] });
      if (!this.nodes.has(edge.target)) this.nodes.set(edge.target, { nodeId: edge.target, upstreamIds: [], downstreamIds: [] });
      
      this.nodes.get(edge.source)!.downstreamIds.push(edge.target);
      this.nodes.get(edge.target)!.upstreamIds.push(edge.source);
    });
  }

  public getDownstreamRecursive(nodeId: string): string[] {
    const affected = new Set<string>();
    const visit = (id: string) => {
      if (affected.has(id)) return;
      affected.add(id);
      this.nodes.get(id)?.downstreamIds.forEach(visit);
    };
    visit(nodeId);
    return Array.from(affected);
  }
}
`);

fs.writeFileSync(path.join(cacheDir, 'CompilationCache.ts'), `
import { Symbol } from '../engine/CompilationContext';

export interface CacheSnapshot {
  versionId: string;
  nodeHashes: Record<string, string>; // node.id -> hash
  symbolTable: Record<string, Symbol>; // Node's compiled symbols
}

export class CompilationCache {
  private currentSnapshot: CacheSnapshot = { versionId: 'init', nodeHashes: {}, symbolTable: {} };

  public getSnapshot(): Readonly<CacheSnapshot> {
    return this.currentSnapshot;
  }

  public commitSnapshot(newSnapshot: CacheSnapshot) {
    this.currentSnapshot = newSnapshot;
  }
}
`);

// ----------------------------------------------------
// 3. M24: COMPILER ENGINE (DIRTY TRACKING)
// ----------------------------------------------------
fs.writeFileSync(path.join(engineDir, 'CompilerEngine.ts'), `
import { CompilationContext, CompilerPass } from './CompilationContext';
import { StudioGraph } from '../../graph/GraphModel';
import { DependencyGraph } from '../cache/DependencyGraph';
import { CompilationCache, CacheSnapshot } from '../cache/CompilationCache';

export class CompilerEngine {
  private passes: CompilerPass[] = [];
  private cache = new CompilationCache();

  public registerPass(pass: CompilerPass) {
    this.passes.push(pass);
  }

  // Helper to hash node state
  private hashNode(node: any): string {
    return JSON.stringify(node); // Naive hash for demonstration
  }

  public compile(graph: StudioGraph, workflowId: string): CompilationContext {
    const prevSnapshot = this.cache.getSnapshot();
    const newSnapshot: CacheSnapshot = { versionId: crypto.randomUUID(), nodeHashes: {}, symbolTable: { ...prevSnapshot.symbolTable } };
    
    const depGraph = new DependencyGraph();
    depGraph.buildFromEdges(graph.edges);

    // 1. Identify explicitly changed nodes
    const explicitlyDirty = new Set<string>();
    graph.nodes.forEach(node => {
      const hash = this.hashNode(node);
      newSnapshot.nodeHashes[node.id] = hash;
      
      if (prevSnapshot.nodeHashes[node.id] !== hash) {
        explicitlyDirty.add(node.id);
      }
    });

    // 2. Propagate Dirtiness Downstream
    const dirtyNodes = new Set<string>();
    explicitlyDirty.forEach(id => {
      depGraph.getDownstreamRecursive(id).forEach(downstreamId => dirtyNodes.add(downstreamId));
    });

    // 3. Prune Orphaned Symbols (Versioned Snapshotting)
    // We clear symbols for any dirty node so they can be freshly recomputed.
    dirtyNodes.forEach(id => {
      Object.keys(newSnapshot.symbolTable).forEach(symKey => {
        if (newSnapshot.symbolTable[symKey].producer === id) {
          delete newSnapshot.symbolTable[symKey];
        }
      });
    });

    console.log(\`[Incremental] \${dirtyNodes.size} nodes marked dirty.\`);

    // 4. Centralized Pass Orchestration
    // Pass gets ONLY the dirty nodes. Passes remain pure and ignorant of caching.
    let context: any = {
      graph: { ...graph, nodes: graph.nodes.filter(n => dirtyNodes.has(n.id)) },
      artifacts: { symbolTable: newSnapshot.symbolTable, dependencyGraph: depGraph }
    };

    if (dirtyNodes.size > 0) {
      for (const pass of this.passes) {
         const result = pass.run(context);
         context = result.context; // Immutable update
      }
    }

    // 5. Commit Cache
    this.cache.commitSnapshot(newSnapshot);

    return context;
  }
}
`);

console.log('Milestone 23.1 & 24 Framework Scaffolded Successfully');
