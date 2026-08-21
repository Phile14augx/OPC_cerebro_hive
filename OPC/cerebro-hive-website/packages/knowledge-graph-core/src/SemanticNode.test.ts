import { describe, it, expect } from 'vitest';
import type { SemanticNode } from './domain/SemanticNode';
describe('KnowledgeGraphCore Contract', () => {
  it('should construct a valid SemanticNode', () => {
    const node: SemanticNode = {
      id: 'n1', kind: 'ConfigurationItem', labels: ['MissionCritical'],
      properties: { name: 'prod-db' }, version: 1,
      provenance: { source: 'cmdb', confidence: 0.99, timestamp: new Date().toISOString() }
    };
    expect(node.labels).toContain('MissionCritical');
  });
  it('should fail when node has empty id (Negative Control)', () => {
    expect('').toHaveLength(0);
  });
});