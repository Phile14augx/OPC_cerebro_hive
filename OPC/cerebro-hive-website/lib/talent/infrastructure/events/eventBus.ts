import { EventEmitter } from 'events';
import { Logger } from '../observability/logger';

const eventBusLogger = new Logger('DomainEventBus');
const internalBus = new EventEmitter();

export type DomainEventType = 
  | 'AssessmentPublished'
  | 'CandidateInvited'
  | 'SubmissionCompleted'
  | 'SkillProfileUpdated'
  | 'OrganizationSkillGraphRebuilt'
  | 'SessionStarted'
  | 'SessionResumed'
  | 'TelemetryBatchReceived'
  | 'AssessmentSubmitted'
  | 'ExecutionQueued'
  | 'WorkerAllocated'
  | 'SandboxCreated'
  | 'ExecutionStarted'
  | 'ExecutionCompleted'
  | 'ExecutionFailed'
  | 'SandboxDestroyed'
  | 'WorkerReleased';

export interface DomainEvent<T = any> {
  type: DomainEventType;
  payload: T;
  timestamp: string;
  traceId?: string;
}

export class DomainEventBus {
  /**
   * Publish a domain event.
   * This decouples core services from downstream side-effects (e.g., sending emails, pushing to queues).
   */
  static publish<T>(type: DomainEventType, payload: T, traceId?: string) {
    const event: DomainEvent<T> = {
      type,
      payload,
      traceId,
      timestamp: new Date().toISOString()
    };
    
    eventBusLogger.info(`Publishing Domain Event: ${type}`, { traceId, eventPayload: payload });
    internalBus.emit(type, event);
  }

  /**
   * Subscribe to a domain event.
   */
  static subscribe<T>(type: DomainEventType, handler: (event: DomainEvent<T>) => void | Promise<void>) {
    internalBus.on(type, async (event: DomainEvent<T>) => {
      try {
        await handler(event);
      } catch (error) {
        eventBusLogger.error(`Error handling Domain Event: ${type}`, error, { traceId: event.traceId });
      }
    });
  }
}
