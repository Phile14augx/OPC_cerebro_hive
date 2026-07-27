
import { StudioGraph } from '../../graph/GraphModel';

export class CanonicalHasher {
  
  static hashAST(graph: StudioGraph): string {
    // 1. Strip transient UI metadata (x, y, selection state)
    // 2. Sort nodes and edges deterministically
    // 3. Serialize and hash
    const normalized = {
      nodes: graph.nodes.map(n => ({ id: n.id, type: n.type, config: n.configuration })).sort((a,b) => a.id.localeCompare(b.id)),
      edges: graph.edges.map(e => ({ source: e.source, target: e.target })).sort((a,b) => (a.source+a.target).localeCompare(b.source+b.target))
    };
    
    // MOCK: Web Crypto API usage would go here
    return 'sha256-' + JSON.stringify(normalized).length; 
  }
}
