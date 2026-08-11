/**
 * Cloud-Agnostic Typed Event Bus
 */

export type EventCategory = 
  | "ResourceLifecycle"
  | "DeploymentLifecycle"
  | "WorkspaceLifecycle"
  | "MarketplaceLifecycle"
  | "AILifecycle"
  | "SecurityLifecycle"
  | "TelemetryLifecycle";

export interface DomainEvent<T = unknown> {
  id: string;
  timestamp: string;
  category: EventCategory;
  type: string; // e.g., 'DeployStarted', 'ResourceCreated', 'VMReady'
  source: string; // The plugin/service that emitted it
  payload: T;
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>;

export interface EventBus {
  publish<T>(event: Omit<DomainEvent<T>, "id" | "timestamp">): void;
  subscribe<T>(category: EventCategory, type: string, handler: EventHandler<T>): () => void;
  subscribeAll(handler: EventHandler<unknown>): () => void;
}
