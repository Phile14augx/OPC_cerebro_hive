import { KnowledgeGraphPort, SemanticNode } from '../../../knowledge-graph-core/src/index';
import { ExecutionRecord } from '../domain/ExecutionRecord';
import { IncidentRecord } from '../domain/IncidentRecord';

export class EvidenceGraphEngine {
  // In a real system, this would be backed by an append-only time-series DB or specialized Graph DB partition
  private executionRecords: ExecutionRecord[] = [];
  private incidentRecords: IncidentRecord[] = [];

  constructor(private readonly canonicalGraph: KnowledgeGraphPort) {}

  public async ingestExecution(record: ExecutionRecord): Promise<void> {
    this.executionRecords.push(record);

    // Option 1: Append an immutable EventNode to the Canonical Graph referencing the Asset
    // We create a lightweight SemanticNode representing the execution event
    const eventNode: SemanticNode = {
      id: record.recordId,
      kind: 'Event',
      labels: ['ExecutionRecord', record.status],
      properties: {
        runbookId: record.runbookId,
        incidentId: record.incidentId,
        durationMs: record.durationMs
      },
      version: 1,
      provenance: {
        createdBy: 'EvidenceGraph',
        sourceSystem: 'AIOps',
        confidenceScore: 1.0,
        createdAt: record.timestamp,
        updatedAt: record.timestamp
      }
    };

    await this.canonicalGraph.addNode(eventNode);

    // Link the target asset to the execution event (Asset HAS_EXECUTION Event)
    await this.canonicalGraph.addEdge({
      id: `${record.targetNodeId}_HAS_EXECUTION_${record.recordId}`,
      sourceId: record.targetNodeId,
      targetId: record.recordId,
      relationshipType: 'HAS_EXECUTION',
      weight: 1.0,
      validFrom: record.timestamp,
      provenance: eventNode.provenance
    });
  }

  public getHistoryForRunbook(runbookId: string): ExecutionRecord[] {
    return this.executionRecords.filter(r => r.runbookId === runbookId);
  }
}
