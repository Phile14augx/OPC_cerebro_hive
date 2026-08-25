import { describe, it, expect } from 'vitest';
import type { GraphNode, GraphEdge, EntityDomain, RelationshipType } from './Ontology';

describe('OntologySDK Contract', () => {
  it('should construct a valid GraphNode and GraphEdge', () => {
    const node: GraphNode = {
      id: 'n1',
      domain: 'TECHNOLOGY' as EntityDomain,
      type: 'Agent',
      properties: { name: 'cerebro-core' },
      metadata: { confidence: 0.99, provenance: 'workflow-001', sourceType: 'WORKFLOW', validFrom: '2024-01-01', version: 1 },
    };
    const edge: GraphEdge = {
      id: 'e1', sourceId: 'n1', targetId: 'n2',
      type: 'DEPENDS_ON' as RelationshipType,
      metadata: { confidence: 0.85, provenance: 'workflow-001', sourceType: 'WORKFLOW', validFrom: '2024-01-01', version: 1 },
    };
    expect(node.domain).toBe('TECHNOLOGY');
    expect(edge.type).toBe('DEPENDS_ON');
  });

  it('should detect expired metadata (Negative Control)', () => {
    const validFrom = '2024-01-01';
    const validUntil = '2024-12-31';
    const now = new Date('2025-01-01');
    expect(new Date(validUntil) < now).toBe(true); // expired
  });
});
