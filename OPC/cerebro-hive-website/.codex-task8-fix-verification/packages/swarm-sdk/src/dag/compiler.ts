/**
 * HiveSwarm — DAG Compiler (HS-101)
 *
 * Transforms a TaskDAG definition into a ready-to-run execution representation:
 *   - Resolves entry/exit nodes
 *   - Topologically sorts nodes (Kahn's algorithm)
 *   - Builds the adjacency maps used by the scheduler
 *   - Produces a CompiledDAG with pre-computed wave groups for parallel dispatch
 *
 * The compiler is pure (no side effects) — it only reads the TaskDAG and
 * produces a CompiledDAG. The Scheduler consumes CompiledDAGs.
 */

import type { TaskDAG, TaskNode, TaskEdge } from "../types/dag.js";
import { validateDAG } from "./validator.js";

// ── Compiled types ────────────────────────────────────────────────────────────

/**
 * A "wave" is a set of nodes that can be dispatched concurrently because
 * none of them depend on each other (they share the same topological level).
 */
export interface ExecutionWave {
  waveIndex:  number;
  nodeIds:    string[];
  /** At least one edge in this wave has type = "parallel" */
  hasParallelEdges: boolean;
}

export interface NodeAdjacency {
  /** Nodes that must complete before this node can start */
  predecessors: string[];
  /** Nodes that this node unlocks on completion */
  successors:   string[];
}

export interface CompiledDAG {
  dagId:       string;
  dagVersion:  number;

  /** Original nodes keyed by ID for O(1) lookup */
  nodes:       Map<string, TaskNode>;
  /** All edges */
  edges:       TaskEdge[];
  /** Adjacency for every node */
  adjacency:   Map<string, NodeAdjacency>;

  /** Entry nodes (no predecessors) */
  entryNodeIds: string[];
  /** Exit nodes (no successors) */
  exitNodeIds:  string[];

  /**
   * Topological execution waves.
   * Wave 0 = entry nodes (run first).
   * Nodes in the same wave can run concurrently.
   */
  waves: ExecutionWave[];

  /** Total node count */
  nodeCount: number;
}

// ── Compiler ─────────────────────────────────────────────────────────────────

export function compileDAG(dag: TaskDAG): CompiledDAG {
  // Validate first — throws on structural errors
  const result = validateDAG(dag);
  if (!result.valid) {
    const msgs = result.errors.map((e) => e.message).join("; ");
    throw new Error(`DAG '${dag.id}' failed validation: ${msgs}`);
  }

  const nodeMap = new Map<string, TaskNode>(dag.nodes.map((n) => [n.id, n]));

  // Build adjacency
  const adjacency = new Map<string, NodeAdjacency>();
  for (const node of dag.nodes) {
    adjacency.set(node.id, { predecessors: [], successors: [] });
  }
  for (const edge of dag.edges) {
    adjacency.get(edge.source)!.successors.push(edge.target);
    adjacency.get(edge.target)!.predecessors.push(edge.source);
  }

  // Determine entry / exit nodes
  const entryNodeIds = dag.nodes.filter((n) => adjacency.get(n.id)!.predecessors.length === 0).map((n) => n.id);
  const exitNodeIds  = dag.nodes.filter((n) => adjacency.get(n.id)!.successors.length === 0).map((n) => n.id);

  // Kahn's topological sort → wave groups
  const waves = buildWaves(dag, adjacency);

  return {
    dagId:       dag.id,
    dagVersion:  dag.version,
    nodes:       nodeMap,
    edges:       dag.edges,
    adjacency,
    entryNodeIds,
    exitNodeIds,
    waves,
    nodeCount:   dag.nodes.length,
  };
}

// ── Wave builder (Kahn's BFS variant) ────────────────────────────────────────

function buildWaves(
  dag:       TaskDAG,
  adjacency: Map<string, NodeAdjacency>,
): ExecutionWave[] {
  // in-degree for each node (parallel edges count as 0 for scheduling purposes
  // because they don't block — we track them separately for metadata)
  const inDegree = new Map<string, number>();
  for (const node of dag.nodes) {
    const blocking = adjacency.get(node.id)!.predecessors.filter((predId) => {
      const edge = dag.edges.find((e) => e.source === predId && e.target === node.id);
      return edge?.type !== "parallel";
    });
    inDegree.set(node.id, blocking.length);
  }

  const parallelEdgeTargets = new Set(
    dag.edges.filter((e) => e.type === "parallel").map((e) => e.target),
  );

  const waves: ExecutionWave[] = [];
  const visited = new Set<string>();
  let waveIndex = 0;

  while (visited.size < dag.nodes.length) {
    // Collect all nodes with in-degree 0 not yet visited
    const wave: string[] = [];
    for (const node of dag.nodes) {
      if (!visited.has(node.id) && inDegree.get(node.id) === 0) {
        wave.push(node.id);
      }
    }

    if (wave.length === 0) break; // Cycle guard (should be caught by validator)

    const hasParallelEdges = wave.some((id) => parallelEdgeTargets.has(id));
    waves.push({ waveIndex, nodeIds: wave, hasParallelEdges });

    // Mark visited and decrement successors' in-degree
    for (const nodeId of wave) {
      visited.add(nodeId);
      for (const succId of adjacency.get(nodeId)!.successors) {
        const edge = dag.edges.find((e) => e.source === nodeId && e.target === succId);
        // Only blocking dependency types reduce in-degree
        if (edge?.type !== "parallel") {
          inDegree.set(succId, (inDegree.get(succId) ?? 1) - 1);
        }
      }
    }

    waveIndex++;
  }

  return waves;
}

// ── Dependency resolver ───────────────────────────────────────────────────────

/**
 * Given a compiled DAG and a set of completed task IDs, returns the next
 * set of node IDs that are unblocked and ready to be scheduled.
 */
export function getReadyNodes(
  compiled:     CompiledDAG,
  completedIds: ReadonlySet<string>,
  skippedIds:   ReadonlySet<string>,
  runningIds:   ReadonlySet<string>,
): string[] {
  const done = new Set([...completedIds, ...skippedIds]);
  const ready: string[] = [];

  for (const [nodeId, adj] of compiled.adjacency.entries()) {
    if (done.has(nodeId) || runningIds.has(nodeId)) continue;

    // Check that all blocking predecessors are done
    const allPredsDone = adj.predecessors.every((predId) => {
      const edge = compiled.edges.find((e) => e.source === predId && e.target === nodeId);
      // parallel edges never block
      if (edge?.type === "parallel") return true;
      return done.has(predId);
    });

    if (allPredsDone) ready.push(nodeId);
  }

  return ready;
}
