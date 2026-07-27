
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

    console.log(`[Incremental] ${dirtyNodes.size} nodes marked dirty.`);

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
