import { describe, expect, it } from 'vitest';
import { DomainGraph } from './index';

describe('DomainGraph', () => {
  it('returns only nodes matching a traversal type query', () => {
    const graph = new DomainGraph();
    graph.addNode({ id: 'agent', type: 'agent', properties: {} });
    graph.addNode({ id: 'tool', type: 'tool', properties: {} });
    graph.addEdge({ id: 'uses', sourceId: 'agent', targetId: 'tool', relationship: 'uses' });
    expect(graph.traverse({ startNodeId: 'agent', targetNodeType: 'tool' }).map(node => node.id)).toEqual(['tool']);
  });
});
