/**
 * M24 — EventDispatcher
 *
 * Central event bus for the execution runtime.
 * Decouples event emission from event consumption —
 * plugins, UI, and observability tools subscribe independently.
 */
import { ExecutionEventType } from '../ExecutionEvents';

export interface DispatchedEvent {
  id: string;
  timestamp: number;
  type: ExecutionEventType;
  payload: unknown;
  stageId?: string;
  nodeId?: string;
}

type EventListener = (event: DispatchedEvent) => void;

export class EventDispatcher {
  private listeners: Map<string, EventListener[]> = new Map();
  private globalListeners: EventListener[] = [];
  private log: DispatchedEvent[] = [];

  on(type: ExecutionEventType, listener: EventListener): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(listener);
    return () => {
      const arr = this.listeners.get(type) ?? [];
      this.listeners.set(type, arr.filter(l => l !== listener));
    };
  }

  onAny(listener: EventListener): () => void {
    this.globalListeners.push(listener);
    return () => { this.globalListeners = this.globalListeners.filter(l => l !== listener); };
  }

  dispatch(type: ExecutionEventType, payload: unknown = {}, stageId?: string, nodeId?: string): void {
    const event: DispatchedEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type, payload, stageId, nodeId,
    };
    this.log.push(event);
    this.listeners.get(type)?.forEach(l => l(event));
    this.globalListeners.forEach(l => l(event));
  }

  getLog(): DispatchedEvent[] { return [...this.log]; }
  clear(): void { this.log = []; }
}
