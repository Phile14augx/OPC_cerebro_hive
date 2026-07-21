/**
 * Immutable Event Sourcing Store
 */

export type DomainEventType = 
  | "ResourceCreated" 
  | "ResourceScaled" 
  | "PolicyViolation" 
  | "RollbackExecuted"
  | "WorkflowStarted"
  | "WorkflowCompleted"
  | "OperationPending"
  | "OperationQueued"
  | "OperationValidating"
  | "OperationPlanning"
  | "OperationAllocating"
  | "OperationProvisioning"
  | "OperationConfiguring"
  | "OperationVerifying"
  | "OperationReady"
  | "OperationFailed";

export interface DomainEvent {
  id: string; // UUID
  correlationId: string;
  type: DomainEventType;
  timestamp: string;
  payload: any;
}

export class EventStore {
  private events: DomainEvent[] = [];

  append(event: DomainEvent) {
    // Events are immutable domain facts. Never modified after insertion.
    this.events.push(Object.freeze({ ...event }));
    console.log(`[EventStore] Appended ${event.type} (${event.id})`);
  }

  replay(correlationId?: string): DomainEvent[] {
    if (correlationId) {
      return this.events.filter(e => e.correlationId === correlationId);
    }
    return [...this.events];
  }
}

export const eventStore = new EventStore();
