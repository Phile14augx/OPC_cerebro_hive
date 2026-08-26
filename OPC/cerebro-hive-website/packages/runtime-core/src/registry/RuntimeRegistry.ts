import { CapabilityType, CapabilityProvider } from '../plugins/CapabilityProvider';
import { CapabilityDescriptor } from './CapabilityDescriptor';

export interface ResolveOptions {
  capability: CapabilityType;
  name?: string; // Resolve a specific provider by name
  region?: string;
  costClass?: 'Low' | 'Medium' | 'High';
  features?: string[];
}

export class RuntimeRegistry {
  private static instance: RuntimeRegistry;
  
  // Organized by CapabilityType -> Provider Name -> Descriptor
  private registry: Map<CapabilityType, Map<string, CapabilityDescriptor<CapabilityProvider>>> = new Map();

  private constructor() {}

  public static getInstance(): RuntimeRegistry {
    if (!RuntimeRegistry.instance) {
      RuntimeRegistry.instance = new RuntimeRegistry();
    }
    return RuntimeRegistry.instance;
  }

  /**
   * Registers a capability descriptor.
   */
  public register<T extends CapabilityProvider>(descriptor: CapabilityDescriptor<T>): void {
    const { capability, name } = descriptor.metadata;
    let capabilityMap = this.registry.get(capability);
    if (!capabilityMap) {
      capabilityMap = new Map();
      this.registry.set(capability, capabilityMap);
    }
    if (capabilityMap.has(name)) {
      throw new Error(`Provider ${name} for capability ${capability} is already registered.`);
    }

    capabilityMap.set(name, descriptor);
  }

  /**
   * Unregisters a capability descriptor and unloads it.
   */
  public async unregister(capability: CapabilityType, name: string): Promise<void> {
    const capabilityMap = this.registry.get(capability);
    if (!capabilityMap || !capabilityMap.has(name)) return;

    const descriptor = capabilityMap.get(name);
    if (!descriptor) return;
    await descriptor.unload();
    capabilityMap.delete(name);
  }

  /**
   * Resolves the best available provider matching the options.
   * If `name` is provided, looks for the exact match.
   * Otherwise, it sorts by Priority and selects the first Healthy provider matching constraints.
   */
  public async resolve<T extends CapabilityProvider>(options: ResolveOptions): Promise<T> {
    const capabilityMap = this.registry.get(options.capability);
    if (!capabilityMap || capabilityMap.size === 0) {
      throw new Error(`No providers found for capability ${options.capability}.`);
    }

    let descriptors = Array.from(capabilityMap.values());

    // Exact name match
    if (options.name) {
      const exactMatch = descriptors.find(d => d.metadata.name === options.name);
      if (!exactMatch) {
        throw new Error(`Provider ${options.name} not found for capability ${options.capability}.`);
      }
      return exactMatch.getProvider() as Promise<T>;
    }

    // Filter by health
    descriptors = descriptors.filter(d => d.health === 'Healthy' || d.health === 'Degraded');

    // Filter by constraints
    if (options.region) {
      descriptors = descriptors.filter(d => d.metadata.region === options.region);
    }
    if (options.costClass) {
      descriptors = descriptors.filter(d => d.metadata.costClass === options.costClass);
    }
    if (options.features && options.features.length > 0) {
      descriptors = descriptors.filter(d => {
        const supported = d.metadata.supportedFeatures || [];
        const feats = options.features || [];
        return feats.every(f => supported.includes(f));
      });
    }

    if (descriptors.length === 0) {
      throw new Error(`No providers found for capability ${options.capability} matching the requested constraints.`);
    }

    // Sort by priority (descending)
    descriptors.sort((a, b) => b.metadata.priority - a.metadata.priority);

    // Return the highest priority provider
    return descriptors[0].getProvider() as Promise<T>;
  }

  /**
   * Lists all registered capability descriptors.
   */
  public listCapabilities(): CapabilityDescriptor<CapabilityProvider>[] {
    const all: CapabilityDescriptor<CapabilityProvider>[] = [];
    for (const map of this.registry.values()) {
      all.push(...Array.from(map.values()));
    }
    return all;
  }

  /**
   * Unloads and clears all providers. Used primarily for testing or safe shutdown.
   */
  public async clearAll(): Promise<void> {
    const unloadPromises: Promise<void>[] = [];
    for (const map of this.registry.values()) {
      for (const descriptor of map.values()) {
        unloadPromises.push(descriptor.unload());
      }
    }
    await Promise.all(unloadPromises);
    this.registry.clear();
  }
}
