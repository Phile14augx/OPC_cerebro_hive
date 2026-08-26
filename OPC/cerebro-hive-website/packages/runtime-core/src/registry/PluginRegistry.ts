import { RuntimeRegistry } from './RuntimeRegistry';
import { ReducerRegistry } from './ReducerRegistry';
import { ExecutionEventRegistry } from './ExecutionEventRegistry';
import { DeterministicReducer } from '@cerebro/runtime-contracts/src/replay/DeterministicReplayContract';
import { EventUpcaster } from '@cerebro/runtime-contracts/src/events/EventUpcaster';
import { CapabilityDescriptor } from './CapabilityDescriptor';
import { CapabilityProvider } from '../plugins/CapabilityProvider';

/**
 * A unified facade passed to plugins during the `onLoad` lifecycle phase.
 * It provides safe, scoped access to register reducers, upcasters, and capabilities.
 */
export class PluginRegistry {
  private isFrozen = false;

  constructor(
    private readonly runtimeRegistry: RuntimeRegistry,
    private readonly reducerRegistry: ReducerRegistry,
    private readonly eventRegistry: ExecutionEventRegistry
  ) {}

  public registerCapability<T extends CapabilityProvider>(descriptor: CapabilityDescriptor<T>): void {
    if (this.isFrozen) throw new Error('Cannot register capability: Registry frozen.');
    this.runtimeRegistry.register(descriptor);
  }

  public registerReducer(eventType: string, reducer: DeterministicReducer<unknown, unknown>): void {
    if (this.isFrozen) throw new Error('Cannot register reducer: Registry frozen.');
    this.reducerRegistry.register(eventType, reducer);
  }

  public registerEventUpcaster(upcaster: EventUpcaster): void {
    if (this.isFrozen) throw new Error('Cannot register upcaster: Registry frozen.');
    this.eventRegistry.registerUpcaster(upcaster);
  }

  public registerEvent(registration: unknown): void {
    if (this.isFrozen) throw new Error('Cannot register event: Registry frozen.');
    this.eventRegistry.registerEvent(registration);
  }

  public freezeAll(): void {
    this.reducerRegistry.freeze();
    this.eventRegistry.freeze();
    this.isFrozen = true;
  }
}
