export interface CapabilityMetadata {
  id: string;
  displayName: string;
  description: string;
  version: string;
  owner: string;
  health: 'Healthy' | 'Degraded' | 'Offline';
  status: 'Active' | 'Deprecated' | 'Maintenance';
  permissions: string[];
  contracts: string[];
  dependencies: string[];
  tags: string[];
  lifecycle: 'Experimental' | 'Beta' | 'GA';
  configuration: Record<string, any>;
}

export class CapabilityRegistry {
  private capabilities: Map<string, CapabilityMetadata> = new Map();

  register(metadata: CapabilityMetadata) {
    if (this.capabilities.has(metadata.id)) {
      throw new Error(`Capability already registered: ${metadata.id}`);
    }
    this.capabilities.set(metadata.id, metadata);
  }

  get(id: string): CapabilityMetadata | undefined {
    return this.capabilities.get(id);
  }

  list(): CapabilityMetadata[] {
    return Array.from(this.capabilities.values());
  }

  resolveDependencies(id: string): CapabilityMetadata[] {
    const cap = this.get(id);
    if (!cap) return [];
    
    return cap.dependencies
      .map(depId => this.get(depId))
      .filter((c): c is CapabilityMetadata => c !== undefined);
  }
}
