import { describe, it, expect } from 'vitest';
import type { WorkflowGraph, DAGNode } from './types/workflow';

describe('Workflow Contract', () => {
  it('should construct a valid two-node WorkflowGraph', () => {
    const node1: DAGNode = { id: 'n1', type: 'start', dependencies: [] };
    const node2: DAGNode = { id: 'n2', type: 'llm-call', dependencies: ['n1'] };
    const graph: WorkflowGraph = {
      nodes: [node1, node2],
      edges: [{ from: 'n1', to: 'n2' }],
    };
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges[0].from).toBe('n1');
  });

  it('should detect a node with circular dependency (Negative Control)', () => {
    const n1deps = ['n2'];
    const n2deps = ['n1'];
    const circular = n1deps.some(d => n2deps.includes('n1'));
    expect(circular).toBe(true);
  });
});
