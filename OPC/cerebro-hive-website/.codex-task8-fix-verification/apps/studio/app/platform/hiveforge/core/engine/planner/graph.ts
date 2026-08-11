/**
 * Execution Graph Contracts
 */

export type TaskStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface ExecutionTask {
  id: string;
  operationId: string;
  providerId: string;
  action: "create" | "update" | "delete" | "read";
  resourceType: string;
  dependencies: string[]; // IDs of tasks that must complete before this one starts
  status: TaskStatus;
  payload: unknown;
}

export interface ExecutionGraph {
  id: string;
  correlationId: string;
  blueprintId: string;
  tasks: Map<string, ExecutionTask>;
}

export class DAGPlanner {
  // Converts a blueprint intent into an ExecutionGraph
  planExecution(blueprint: unknown): ExecutionGraph {
    return {
      id: `exec-${Date.now()}`,
      correlationId: `corr-${Date.now()}`,
      blueprintId: "bp.unknown",
      tasks: new Map()
    };
  }

  // Converts an ExecutionGraph into an inverted RollbackGraph
  planRollback(executionGraph: ExecutionGraph): ExecutionGraph {
    const rollbackTasks = new Map<string, ExecutionTask>();
    
    executionGraph.tasks.forEach(task => {
      // Invert action (create -> delete)
      const rollbackAction = task.action === "create" ? "delete" : task.action === "delete" ? "create" : task.action;
      // Invert dependencies conceptually here
      rollbackTasks.set(`rb-${task.id}`, { ...task, id: `rb-${task.id}`, action: rollbackAction, dependencies: [] });
    });

    return {
      id: `rb-graph-${Date.now()}`,
      correlationId: executionGraph.correlationId,
      blueprintId: executionGraph.blueprintId,
      tasks: rollbackTasks
    };
  }
}
