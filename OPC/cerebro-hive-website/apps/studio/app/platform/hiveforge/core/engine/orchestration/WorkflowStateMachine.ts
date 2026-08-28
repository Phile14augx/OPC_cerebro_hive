import { operationRepository } from "../../repositories/OperationRepository";
import { eventStore, type DomainEventType } from "../../events/EventStore";
import { Operation } from "@cerebro/db";

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

const OPERATION_EVENT_TYPES: Record<WorkflowState, DomainEventType> = {
  Pending: "OperationPending",
  Queued: "OperationQueued",
  Validating: "OperationValidating",
  Planning: "OperationPlanning",
  Allocating: "OperationAllocating",
  Provisioning: "OperationProvisioning",
  Configuring: "OperationConfiguring",
  Verifying: "OperationVerifying",
  Ready: "OperationReady",
  Failed: "OperationFailed",
};

export class WorkflowStateMachine {
  
  async transition(operationId: string, newState: WorkflowState, payload?: unknown): Promise<Operation> {
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
    eventStore.append({
      id: crypto.randomUUID(),
      correlationId: operationId,
      type: OPERATION_EVENT_TYPES[newState],
      timestamp: new Date().toISOString(),
      payload: payload || {}
    });

    return updated;
  }
}

export const workflowEngine = new WorkflowStateMachine();
