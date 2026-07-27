
import { StudioGraph } from '../graph/GraphModel';
import { CompilerResult, Diagnostic } from './CompilerErrors';
import { NodeRegistry } from '../nodes/registry';

export class CompilerPipeline {
  static compile(graph: StudioGraph): CompilerResult {
    console.log('[Compiler] Phase 1: Normalize');
    const normalizedGraph = this.normalize(graph);
    
    console.log('[Compiler] Phase 2: Validate');
    const diagnostics = this.validate(normalizedGraph);
    if (diagnostics.some(d => d.level === 'Error')) {
      return { schema: null, diagnostics, statistics: { nodeCount: 0, edgeCount: 0, estimatedCost: 0 } };
    }
    
    console.log('[Compiler] Phase 3: Optimize');
    const optimizedGraph = this.optimize(normalizedGraph);
    
    console.log('[Compiler] Phase 4: Compile');
    const schema = this.generateSchema(optimizedGraph);
    
    return {
      schema,
      diagnostics,
      statistics: { nodeCount: optimizedGraph.nodes.length, edgeCount: optimizedGraph.edges.length, estimatedCost: 0.05 }
    };
  }

  private static normalize(graph: StudioGraph) { return graph; }
  
  private static validate(graph: StudioGraph): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const node of graph.nodes) {
      const def = NodeRegistry.get(node.type);
      if (!def) {
        diagnostics.push({ level: 'Error', message: `Unknown node type: ${node.type}`, nodeId: node.id });
        continue;
      }
      diagnostics.push(...def.validator(node));
    }
    return diagnostics;
  }
  
  private static optimize(graph: StudioGraph) { return graph; }
  
  private static generateSchema(graph: StudioGraph) {
    return {
      version: '1.0',
      nodes: graph.nodes.map(n => NodeRegistry.get(n.type)?.compiler(n)),
      edges: graph.edges
    };
  }
}
