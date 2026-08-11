import { DAGPlanner, ExecutionGraph } from "./graph";
import { Plugin } from "../../contracts/plugin";
import { workflowEngine } from "../orchestration/WorkflowStateMachine";
import { provisioningQueue } from "../worker/InMemoryQueue";

export class ExecutionPlanner {
  private dagPlanner = new DAGPlanner();

  /**
   * Plans the execution of a Deployment.
   * In a real implementation, this would parse the Blueprint's schema/template
   * and break it down into atomic tasks (e.g., Network, Storage, Compute).
   */
  async createExecutionGraph(operationId: string, blueprint: Plugin, config: any): Promise<ExecutionGraph> {
    const graph = this.dagPlanner.planExecution(blueprint);
    // Hardcode a simple DAG for demonstration: Network -> Compute
    graph.tasks.set("task-1", {
      id: "task-1",
      operationId,
      providerId: "cloud-compute", // from core plugins
      action: "create",
      resourceType: "network",
      dependencies: [],
      status: "pending",
      payload: config
    });
    
    graph.tasks.set("task-2", {
      id: "task-2",
      operationId,
      providerId: "cloud-compute",
      action: "create",
      resourceType: "compute",
      dependencies: ["task-1"], // Wait for network
      status: "pending",
      payload: config
    });

    // Enqueue tasks (mock orchestration - realistically the DAG planner orchestrates this)
    for (const task of graph.tasks.values()) {
      await provisioningQueue.add(`deploy-${task.id}`, task, { attempts: 3 });
    }

    return graph;
  }
}

export const executionPlanner = new ExecutionPlanner();
