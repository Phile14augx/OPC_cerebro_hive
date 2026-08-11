import { provisioningQueue, Job } from "./InMemoryQueue";
import { workflowEngine } from "../orchestration/WorkflowStateMachine";
import { platformRegistry } from "../../registry/PlatformRegistry";

export class ProvisioningWorker {
  
  start() {
    console.log("[ProvisioningWorker] Starting worker...");
    provisioningQueue.process(async (job: Job) => {
      console.log(`[ProvisioningWorker] Processing job ${job.name} (ID: ${job.id})`);
      
      const { operationId, providerId, resourceType, action, payload } = job.data;
      
      try {
        // Transition to Provisioning
        await workflowEngine.transition(operationId, "Provisioning");
        
        // Lookup provider plugin
        const plugin = platformRegistry.get(providerId);
        if (!plugin || !plugin.provider) {
          throw new Error(`Provider ${providerId} not found or not executable.`);
        }

        // Execute provider driver
        if (action === "create") {
          await plugin.provider.create(operationId, resourceType, payload);
        } else if (action === "delete") {
          await plugin.provider.delete(operationId, resourceType);
        }
        
        // Transition to Ready
        await workflowEngine.transition(operationId, "Ready");
        console.log(`[ProvisioningWorker] Job ${job.id} completed successfully.`);

      } catch (error) {
        console.error(`[ProvisioningWorker] Job ${job.id} failed during execution.`, error);
        await workflowEngine.transition(operationId, "Failed", { error: (error as Error).message });
        throw error; // Re-throw to trigger InMemoryQueue retries
      }
    });
  }
}

export const provisioningWorker = new ProvisioningWorker();
