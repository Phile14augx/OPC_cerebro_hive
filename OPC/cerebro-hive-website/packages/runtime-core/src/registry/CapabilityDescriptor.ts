import { CapabilityType, CapabilityProvider } from '../plugins/CapabilityProvider';

export type ProviderHealth = 'Healthy' | 'Degraded' | 'Unavailable';

export interface CapabilityMetadata {
  name: string;             // e.g., 'OpenAI-GPT4'
  capability: CapabilityType; // e.g., 'LLMProvider'
  version: string;
  priority: number;         // Higher number = higher priority during resolution
  supportedModels?: string[];
  supportedFeatures?: string[];
  costClass?: 'Low' | 'Medium' | 'High';
  region?: string;
}

/**
 * The Descriptor manages the provider lifecycle, health, and metadata.
 * The runtime interacts with this descriptor instead of raw providers.
 */
export class CapabilityDescriptor<T extends CapabilityProvider = CapabilityProvider> {
  private _providerInstance: T | null = null;
  private _health: ProviderHealth = 'Unavailable';
  
  public readonly metadata: CapabilityMetadata;
  private readonly factory: () => T | Promise<T>;

  constructor(metadata: CapabilityMetadata, factory: () => T | Promise<T>) {
    this.metadata = metadata;
    this.factory = factory;
  }

  public get health(): ProviderHealth {
    return this._health;
  }

  public setHealth(status: ProviderHealth): void {
    this._health = status;
  }

  /**
   * Lazily loads and initializes the provider.
   * Returns a singleton instance for this descriptor.
   */
  public async getProvider(): Promise<T> {
    if (this._health === 'Unavailable') {
      throw new Error(`Capability ${this.metadata.name} is currently unavailable.`);
    }

    if (!this._providerInstance) {
      this._providerInstance = await this.factory();
      if (this._providerInstance.initialize) {
        await this._providerInstance.initialize();
      }
    }
    return this._providerInstance;
  }

  /**
   * Unloads the provider from memory, calling its dispose method if it exists.
   */
  public async unload(): Promise<void> {
    if (this._providerInstance) {
      if (this._providerInstance.dispose) {
        await this._providerInstance.dispose();
      }
      this._providerInstance = null;
    }
  }
}
