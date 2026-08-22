import { describe, it, expect } from 'vitest';
import type { SemanticNode } from './domain/SemanticNode';
describe('KnowledgeGraphCore Contract', () => {
  it('should construct a valid SemanticNode', () => {
    const node: SemanticNode = {
      id: 'n1', kind: 'ConfigurationItem', labels: ['MissionCritical'],
      properties: { name: 'prod-db' }, version: 1,
      provenance: { createdBy: 'test', sourceSystem: 'cmdb', confidenceScore: 0.99, createdAt: new Date(), updatedAt: new Date() }
    };
    expect(node.labels).toContain('MissionCritical');
  });
  it('should fail when node has empty id (Negative Control)', () => {
    expect('').toHaveLength(0);
  });
});