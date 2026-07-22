import { operationRepository } from "../../repositories/OperationRepository";
import { eventStore } from "../../events/EventStore";
import { Operation } from "@prisma/client";

export type WorkflowState = 
  | "Pending"
  | "Queued"
  | "Validating"
  | "Planning"
  | "Allocating"
  | "Provisioning"
  | "Configuring"
  | "Verifying"
  | "Ready"
  | "Failed";

export class WorkflowStateMachine {
  
  async transition(operationId: string, newState: WorkflowState, payload?: any): Promise<Operation> {
    const operation = await operationRepository.findById(operationId);
    if (!operation) throw new Error(`Operation ${operationId} not found`);

    // Basic transition validation (in a real system we'd enforce a rigid state machine map)
    const validTransitions: Record<string, WorkflowState[]> = {
      "queued": ["Validating", "Failed"],
      "validating": ["Planning", "Failed"],
      "planning": ["Allocating", "Failed"],
      "allocating": ["Provisioning", "Failed"],
      "provisioning": ["Configuring", "Failed"],
      "configuring": ["Verifying", "Failed"],
      "verifying": ["Ready", "Failed"],
    };

    const currentState = operation.status.toLowerCase();
    
    // Convert current state to match transition keys, defaulting if it's the initial Prisma lowercase "queued"
    const allowed = validTransitions[currentState] || [];
    if (!allowed.includes(newState) && newState !== "Failed") {
      console.warn(`[WorkflowStateMachine] Non-standard transition from ${currentState} to ${newState}`);
    }

    // Update DB
    const updated = await operationRepository.update(operationId, { status: newState });

    // Emit Domain Event
    const eventType = `Operation${newState}`;
    eventStore.append({
      id: crypto.randomUUID(),
      correlationId: operationId,
      type: eventType as any,
      timestamp: new Date().toISOString(),
      payload: payload || {}
    });

    return updated;
  }
}

export const workflowEngine = new WorkflowStateMachine();
