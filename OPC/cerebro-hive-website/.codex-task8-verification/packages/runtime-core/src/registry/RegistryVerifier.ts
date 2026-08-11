import { ReducerRegistry } from './ReducerRegistry';
import { ExecutionEventRegistry } from './ExecutionEventRegistry';
import { RuntimeRegistry } from './RuntimeRegistry';

export interface BootManifest {
  status: 'Healthy' | 'Degraded' | 'Failed';
  eventsRegistered: number;
  reducersRegistered: number;
  capabilitiesRegistered: number;
  warnings: string[];
  errors: string[];
}

export class RegistryVerifier {
  constructor(
    private eventRegistry: ExecutionEventRegistry,
    private reducerRegistry: ReducerRegistry,
    private runtimeRegistry: RuntimeRegistry
  ) {}

  public verifyAndFreeze(): BootManifest {
    const manifest: BootManifest = {
      status: 'Healthy',
      eventsRegistered: 0,
      reducersRegistered: 0,
      capabilitiesRegistered: 0,
      warnings: [],
      errors: []
    };

    const events = this.eventRegistry.getRegisteredEvents();
    manifest.eventsRegistered = events.length;

    events.forEach(event => {
      // Rule: Every event MUST have a corresponding reducer
      if (!this.reducerRegistry.hasReducer(event.type)) {
        manifest.errors.push(`Event type '${event.type}' is registered but has no corresponding reducer.`);
      }

      // Rule: Event schemas must declare a version
      if (!event.schemaVersion) {
        manifest.warnings.push(`Event type '${event.type}' does not declare a schemaVersion. Defaults to 1.`);
      }
      
      // Rule: Should have a validator
      if (!event.validator) {
        manifest.warnings.push(`Event type '${event.type}' has no payload validator registered.`);
      }
    });

    manifest.capabilitiesRegistered = this.runtimeRegistry.listCapabilities().length;

    // TODO: Determine exact number of registered reducers. ReducerRegistry needs a way to count them.
    // For now, we assume it matches events if healthy.

    if (manifest.errors.length > 0) {
      manifest.status = 'Failed';
      throw new Error(`Registry Verification Failed:\n${manifest.errors.join('\n')}`);
    } else if (manifest.warnings.length > 0) {
      manifest.status = 'Degraded';
    }

    // Freeze all registries to prevent runtime modifications
    this.eventRegistry.freeze();
    this.reducerRegistry.freeze();

    return manifest;
  }
}
