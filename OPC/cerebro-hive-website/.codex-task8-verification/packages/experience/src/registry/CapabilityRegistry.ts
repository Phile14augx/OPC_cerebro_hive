
export interface ProductCapability {
  id: string;
  name: string;
  navigationEntry?: { label: string; path: string; icon: string };
  panels?: Array<{ id: string; location: 'left' | 'right' | 'bottom'; component: any }>;
}

class CapabilityRegistryImpl {
  private capabilities = new Map<string, ProductCapability>();

  register(capability: ProductCapability) {
    this.capabilities.set(capability.id, capability);
  }

  getCapabilities() {
    return Array.from(this.capabilities.values());
  }
}

export const CapabilityRegistry = new CapabilityRegistryImpl();
