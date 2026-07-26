/**
 * HiveSwarm — DAG Validator (HS-102)
 *
 * Validates a TaskDAG before it is submitted to the runtime:
 *   1. No cycles (DFS-based Kahn's algorithm check)
 *   2. All edge source/target node IDs exist in the node list
 *   3. At least one entry node exists (no incoming edges)
 *   4. No orphan nodes (disconnected from the graph when node count > 1)
 *   5. Conditional edges have a condition string
 *   6. Loop nodes have a loopExitCondition
 */

import type { TaskDAG, DAGValidationError, TaskNode, TaskEdge } from "../types/dag.js";

export interface ValidationResult {
  valid:  boolean;
  errors: DAGValidationError[];
}

export function validateDAG(dag: TaskDAG): ValidationResult {
  const errors: DAGValidationError[] = [];
  const nodeIds = new Set(dag.nodes.map((n) => n.id));

  // 1. All edge endpoints must reference existing nodes
  for (const edge of dag.edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        code:    "MISSING_NODE",
        message: `Edge references unknown source node '${edge.source}'`,
        nodeIds: [edge.source],
      });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({
        code:    "MISSING_NODE",
        message: `Edge references unknown target node '${edge.target}'`,
        nodeIds: [edge.target],
      });
    }
  }

  // 2. Conditional edges need a condition expression
  for (const edge of dag.edges) {
    if (edge.type === "conditional" && !edge.condition?.trim()) {
      errors.push({
        code:    "INVALID_EDGE",
        message: `Conditional edge from '${edge.source}' to '${edge.target}' is missing a condition expression`,
        nodeIds: [edge.source, edge.target],
      });
    }
    if (edge.type === "dynamic" && !edge.dynamicInputTemplate?.trim()) {
      errors.push({
        code:    "INVALID_EDGE",
        message: `Dynamic edge from '${edge.source}' to '${edge.target}' is missing dynamicInputTemplate`,
        nodeIds: [edge.source, edge.target],
      });
    }
  }

  // 3. Loop nodes must have an exit condition
  for (const node of dag.nodes) {
    const hasLoopOutEdge = dag.edges.some((e) => e.source === node.id && e.type === "loop");
    if (hasLoopOutEdge && !node.loopExitCondition?.trim()) {
      errors.push({
        code:    "INVALID_EDGE",
        message: `Loop node '${node.id}' is missing a loopExitCondition`,
        nodeIds: [node.id],
      });
    }
  }

  // 4. Detect cycles using DFS colouring (grey = in stack, black = done)
  const cycleNodes = detectCycles(dag.nodes, dag.edges);
  if (cycleNodes.length > 0) {
    errors.push({
      code:    "CYCLE_DETECTED",
      message: `Cycle detected involving nodes: ${cycleNodes.join(", ")}`,
      nodeIds: cycleNodes,
    });
  }

  // 5. Must have at least one entry node (no incoming edges)
  if (dag.nodes.length > 0) {
    const hasIncoming = new Set(dag.edges.map((e) => e.target));
    const entryNodes  = dag.nodes.filter((n) => !hasIncoming.has(n.id));
    if (entryNodes.length === 0) {
      errors.push({
        code:    "MISSING_ENTRY",
        message: "DAG has no entry nodes (all nodes have incoming edges — possible cycle or missing start node)",
      });
    }
  }

  // 6. Detect orphan nodes (not connected by any edge, and dag has > 1 node)
  if (dag.nodes.length > 1) {
    const connected = new Set<string>();
    for (const edge of dag.edges) {
      connected.add(edge.source);
      connected.add(edge.target);
    }
    const orphans = dag.nodes.filter((n) => !connected.has(n.id));
    if (orphans.length > 0) {
      errors.push({
        code:    "ORPHAN_NODE",
        message: `Orphan nodes detected (not connected to any edge): ${orphans.map((n) => n.id).join(", ")}`,
        nodeIds: orphans.map((n) => n.id),
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Cycle detection (DFS) ─────────────────────────────────────────────────────

type Colour = "white" | "grey" | "black";

function detectCycles(nodes: TaskNode[], edges: TaskEdge[]): string[] {
  const adj   = new Map<string, string[]>();
  const color = new Map<string, Colour>();

  for (const node of nodes) {
    adj.set(node.id, []);
    color.set(node.id, "white");
  }
  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
  }

  const cycleNodes: string[] = [];

  function dfs(id: string): boolean {
    color.set(id, "grey");
    for (const neighbour of (adj.get(id) ?? [])) {
      if (color.get(neighbour) === "grey") {
        cycleNodes.push(id, neighbour);
        return true;
      }
      if (color.get(neighbour) === "white") {
        if (dfs(neighbour)) return true;
      }
    }
    color.set(id, "black");
    return false;
  }

  for (const node of nodes) {
    if (color.get(node.id) === "white") {
      if (dfs(node.id)) break;
    }
  }

  return [...new Set(cycleNodes)];
}
