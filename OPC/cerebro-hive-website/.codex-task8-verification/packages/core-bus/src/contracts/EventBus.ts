import { DomainEvent } from './DomainEvent';

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

export interface EventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe<T>(eventType: string, handler: EventHandler<T>): void;
  once<T>(eventType: string, handler: EventHandler<T>): void;
  request<Req, Res>(eventType: string, payload: Req): Promise<Res>;
  respond<Req, Res>(eventType: string, handler: (payload: Req) => Promise<Res>): void;
  middleware(fn: (event: DomainEvent, next: () => Promise<void>) => Promise<void>): void;
  interceptors(): void;
}
