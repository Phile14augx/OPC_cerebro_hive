
export interface CapabilityDefinition {
  capabilityId: string;
  version: string;
  implementationClass: string;
  requirements: string[]; // e.g., 'gpu', 'high-memory'
}

export class CapabilityRegistry {
  private registry: Map<string, CapabilityDefinition> = new Map();

  register(def: CapabilityDefinition) {
    this.registry.set(`${def.capabilityId}@${def.version}`, def);
  }

  resolve(capabilityId: string, version: string): CapabilityDefinition {
    const def = this.registry.get(`${capabilityId}@${version}`);
    if (!def) throw new Error(`Capability ${capabilityId}@${version} not found`);
    return def;
  }
}
