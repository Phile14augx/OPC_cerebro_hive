
class CapabilityRegistryImpl {
  private capabilities = new Set<string>();

  register(capability: string) {
    this.capabilities.add(capability);
  }

  has(capability: string) {
    return this.capabilities.has(capability);
  }

  validateRequirements(requires: string[]): boolean {
    return requires.every(req => this.has(req));
  }
}

export const CapabilityRegistry = new CapabilityRegistryImpl();
