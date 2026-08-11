import { workflowEngine } from "./orchestration/WorkflowStateMachine";
import { policyEngine } from "./PolicyEngine";
import { executionPlanner } from "./planner/ExecutionPlanner";
import { platformRegistry } from "../registry/PlatformRegistry";
import { pricingService } from "../services/PricingService";
import { operationRepository } from "../repositories/OperationRepository";

export class DeploymentOrchestrator {
  
  async startOrchestration(operationId: string, blueprintId: string, config: any) {
    try {
      // 1. Queued -> Validating
      await workflowEngine.transition(operationId, "Validating");
      
      const blueprint = platformRegistry.get(blueprintId);
      if (!blueprint) {
        throw new Error(`Blueprint ${blueprintId} not found`);
      }

      // 1a. Pricing Estimation
      const cost = await pricingService.estimate(blueprint, config);
      // In a real app we'd save this cost to the Deployment record here.
      console.log(`[DeploymentOrchestrator] Estimated cost for ${blueprintId}: $${cost.monthlyCost}/mo`);

      // 1b. Policy Evaluation (Need to generate an initial mock graph or evaluate based on blueprint)
      // Since PolicyEngine takes an ExecutionGraph, we plan first, or we do a pre-plan validation.
      // We will do a basic validation here.
      const prePlanGraph = await executionPlanner.createExecutionGraph(operationId, blueprint, config);
      const policyResult = await policyEngine.evaluate(prePlanGraph);
      if (!policyResult.allowed) {
        throw new Error(`Policy Violation: ${policyResult.violations.join(", ")}`);
      }

      // 2. Validating -> Planning
      await workflowEngine.transition(operationId, "Planning");
      // DAG is already built above for policy, we reuse it or rebuild.
      const executionGraph = prePlanGraph;

      // 3. Planning -> Allocating
      await workflowEngine.transition(operationId, "Allocating");
      
      // Enqueue tasks into Worker Queue (This is handled inside our ExecutionPlanner for now)
      // ExecutionPlanner currently pushes to the queue inside createExecutionGraph, which is slightly coupled.
      // In a real system, Allocator would pull the graph and push to BullMQ.

    } catch (error) {
      console.error(`[DeploymentOrchestrator] Failed orchestration for operation ${operationId}`, error);
      await workflowEngine.transition(operationId, "Failed", { error: (error as Error).message });
    }
  }
}

export const deploymentOrchestrator = new DeploymentOrchestrator();
