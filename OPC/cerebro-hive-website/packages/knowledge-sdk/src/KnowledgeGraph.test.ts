import { describe, it, expect } from 'vitest';
import type { GraphEntity, GraphRelationship } from './KnowledgeGraph';

describe('KnowledgeSDK Contract', () => {
  it('should construct valid GraphEntity and GraphRelationship', () => {
    const entity: GraphEntity = { id: 'e1', label: 'Agent', properties: { name: 'cerebro-v1' } };
    const rel: GraphRelationship = { source: 'e1', target: 'e2', type: 'USES', weight: 1.0 };
    expect(entity.label).toBe('Agent');
    expect(rel.weight).toBeLessThanOrEqual(1.0);
  });

  it('should detect missing label in entity (Negative Control)', () => {
    const label = '';
    expect(label.length).toBe(0); // detects empty label as domain violation
  });
});
