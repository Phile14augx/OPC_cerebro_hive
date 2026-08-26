import { ExecutionEvent } from '@cerebro/runtime-contracts/src/events/ExecutionEvent';
import { EventUpcaster } from '@cerebro/runtime-contracts/src/events/EventUpcaster';

export interface EventRegistration {
  type: string;
  schemaVersion: number;
  validator?: (payload: Record<string, unknown>) => void;
  serializer?: (payload: Record<string, unknown>) => string;
  deserializer?: (raw: string) => unknown;
}

export class ExecutionEventRegistry {
  private upcasters: Map<string, Map<number, EventUpcaster>> = new Map();
  private events: Map<string, EventRegistration> = new Map();
  private isFrozen = false;

  public freeze(): void {
    this.isFrozen = true;
  }

  public registerEvent(registration: EventRegistration): void {
    if (this.isFrozen) throw new Error('Cannot register events after runtime has started.');
    if (this.events.has(registration.type)) {
      throw new Error(`Event type ${registration.type} is already registered.`);
    }
    this.events.set(registration.type, registration);
  }

  public getRegisteredEvents(): EventRegistration[] {
    return Array.from(this.events.values());
  }

  /**
   * Registers an upcaster for schema evolution.
   */
  public registerUpcaster(upcaster: EventUpcaster): void {
    if (this.isFrozen) throw new Error('Cannot register upcasters after runtime has started.');
    let versionMap = this.upcasters.get(upcaster.eventType);
    if (!versionMap) {
      versionMap = new Map();
      this.upcasters.set(upcaster.eventType, versionMap);
    }
    if (versionMap.has(upcaster.fromVersion)) {
      throw new Error(`Upcaster already registered for ${upcaster.eventType} from version ${upcaster.fromVersion}`);
    }
    versionMap.set(upcaster.fromVersion, upcaster);
  }

  /**
   * Upcasts an event payload to the latest registered schema version by traversing the upcaster chain.
   * This is executed lazily by the ReplayService before handing the event to the Reducer.
   */
  public upcastEvent(event: ExecutionEvent<unknown>): ExecutionEvent<unknown> {
    let currentVersion = event.schemaVersion || 1;
    let currentPayload = event.payload;

    const versionMap = this.upcasters.get(event.type);
    
    if (versionMap) {
      let upcaster = versionMap.get(currentVersion);
      while (upcaster) {
        currentPayload = upcaster.upcast(currentPayload);
        currentVersion = upcaster.toVersion;
        upcaster = versionMap.get(currentVersion);
      }
    }

    return {
      ...event,
      schemaVersion: currentVersion,
      payload: currentPayload
    };
  }
}
