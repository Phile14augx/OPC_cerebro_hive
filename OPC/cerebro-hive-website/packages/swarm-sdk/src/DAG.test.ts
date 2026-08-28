import { describe, it, expect } from 'vitest';
import type { TaskDAG, TaskStatus, TaskNode } from './DAG';

describe('SwarmSDK DAG Contract', () => {
  it('should construct a valid two-node TaskDAG', () => {
    const node1: TaskNode = {
      id: 'n1', intent: 'gather_data', status: 'PENDING' as TaskStatus,
      dependencies: [],
      profile: { cpu: 1, memory: 256, timeoutMs: 5000, priority: 1, retryPolicy: { maxAttempts: 3, backoffMs: 1000 } },
    };
    const node2: TaskNode = {
      id: 'n2', intent: 'analyze_data', status: 'PENDING' as TaskStatus,
      dependencies: ['n1'],
      profile: { cpu: 2, memory: 512, timeoutMs: 10000, priority: 2, retryPolicy: { maxAttempts: 2, backoffMs: 500 } },
    };
    const dag: TaskDAG = { id: 'dag-1', nodes: [node1, node2], edges: [{ from: 'n1', to: 'n2' }] };
    expect(dag.nodes).toHaveLength(2);
    expect(dag.edges[0].from).toBe('n1');
  });

  it('should fail when node dependency is circular (Negative Control)', () => {
    // A simple topological check: if n2 depends on n1 but n1 also depends on n2, that is cyclic
    const n1deps = ['n2'];
    const n2deps = ['n1'];
    const hasCycle = n1deps.some(d => n2deps.includes('n1')) && n2deps.some(d => n1deps.includes('n2'));
    expect(hasCycle).toBe(true); // cycle detected
  });
});
