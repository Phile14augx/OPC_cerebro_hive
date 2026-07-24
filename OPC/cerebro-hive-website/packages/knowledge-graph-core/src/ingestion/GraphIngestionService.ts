import { KnowledgeGraphPort } from '../ports/KnowledgeGraphPort';
import { SemanticNode } from '../domain/SemanticNode';
import { SemanticEdge } from '../domain/SemanticEdge';
import { Provenance } from '../domain/Provenance';

export class GraphIngestionService {
  constructor(private readonly graph: KnowledgeGraphPort) {}

  private createProvenance(source: string): Provenance {
    return {
      createdBy: 'IngestionService',
      sourceSystem: source,
      confidenceScore: 1.0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async handleAssetRegistered(assetId: string, type: string, properties: any) {
    const node: SemanticNode = {
      id: assetId,
      kind: type,
      labels: properties.labels || [],
      properties,
      version: 1,
      provenance: this.createProvenance('asset-core')
    };
    await this.graph.addNode(node);
  }

  async handleDependencyCreated(sourceId: string, targetId: string, relationshipType: string) {
    const edge: SemanticEdge = {
      id: `${sourceId}_${relationshipType}_${targetId}`,
      sourceId,
      targetId,
      relationshipType,
      weight: 1.0,
      validFrom: new Date(),
      provenance: this.createProvenance('asset-core')
    };
    await this.graph.addEdge(edge);
  }
}
