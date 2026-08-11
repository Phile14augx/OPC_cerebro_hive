
import { EntityResolutionPipeline } from './EntityResolution';
import { PostgresGraphStore } from './GraphStore';

export class GraphIngestionWorker {
  constructor(
    private store: PostgresGraphStore,
    private resolver: EntityResolutionPipeline
  ) {}

  async onDocumentIngested(event: any) {
    console.log(`[GraphIngestion] Processing DocumentIngested event for graph extraction...`);
    
    // Mock extraction
    const rawAlice = { name: 'Alice', type: 'Person', domain: 'ORGANIZATION' };
    const rawCodeBot = { name: 'CodeBot', type: 'Agent', domain: 'TECHNOLOGY' };
    
    const nodeAlice = this.resolver.resolve(rawAlice);
    const nodeCodeBot = this.resolver.resolve(rawCodeBot);
    
    await this.store.upsertNode(nodeAlice);
    await this.store.upsertNode(nodeCodeBot);
    
    await this.store.upsertEdge({
      id: 'edge-1',
      sourceId: nodeAlice.id,
      targetId: nodeCodeBot.id,
      type: 'USES',
      metadata: {
        confidence: 0.95,
        provenance: 'Doc:Onboarding.md',
        sourceType: 'DOCUMENT',
        validFrom: new Date().toISOString(),
        version: 1
      }
    });
  }
}
