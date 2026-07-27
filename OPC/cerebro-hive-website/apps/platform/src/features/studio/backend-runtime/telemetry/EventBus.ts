
export type DomainEventType = 
  | 'ExecutionAccepted' | 'ExecutionStarted' | 'StageStarted'
  | 'NodeStarted' | 'NodeCompleted' | 'NodeFailed'
  | 'RetryScheduled' | 'ArtifactCreated' | 'ArtifactConsumed'
  | 'ExecutionCompleted';

export interface DomainEvent {
  eventId: string;
  type: DomainEventType;
  executionId: string;
  timestamp: string;
  payload: any;
}

export class EventBus {
  static emit(event: Omit<DomainEvent, 'eventId' | 'timestamp'>) {
    console.log(`[EventBus] Emitted: ${event.type} for execution ${event.executionId}`);
  }
}
