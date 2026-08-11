export type EdgeType = 'Consumes' | 'Produces' | 'ExportsTo';

export interface LineageEdge {
  id: string;
  sourceDatasetId: string;
  targetDatasetId: string;
  edgeType: EdgeType;
  description?: string;
}

export class LineageGraph {
  private edges: LineageEdge[] = [];

  addEdge(edge: LineageEdge) {
    this.edges.push(edge);
  }

  getDownstream(datasetId: string): LineageEdge[] {
    return this.edges.filter(e => e.sourceDatasetId === datasetId);
  }

  getUpstream(datasetId: string): LineageEdge[] {
    return this.edges.filter(e => e.targetDatasetId === datasetId);
  }

  /**
   * Recursively traverses downstream to find all impacted datasets.
   */
  getDownstreamImpact(datasetId: string, visited = new Set<string>()): string[] {
    if (visited.has(datasetId)) return [];
    visited.add(datasetId);

    const directDownstream = this.getDownstream(datasetId).map(e => e.targetDatasetId);
    let allImpacted = [...directDownstream];

    for (const downstreamId of directDownstream) {
      allImpacted = allImpacted.concat(this.getDownstreamImpact(downstreamId, visited));
    }

    // Deduplicate
    return Array.from(new Set(allImpacted));
  }
}
