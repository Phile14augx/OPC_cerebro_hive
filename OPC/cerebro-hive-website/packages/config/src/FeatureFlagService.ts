export interface IFeatureFlagService {
  isEnabled(flagKey: string, context?: any): Promise<boolean>;
  getVariant(flagKey: string, context?: any): Promise<string | undefined>;
}

export class InMemoryFeatureFlagService implements IFeatureFlagService {
  private flags: Map<string, boolean> = new Map();
  private variants: Map<string, string> = new Map();

  setFlag(key: string, value: boolean) {
    this.flags.set(key, value);
  }

  setVariant(key: string, value: string) {
    this.variants.set(key, value);
  }

  async isEnabled(flagKey: string, context?: any): Promise<boolean> {
    // In an enterprise system, this would call LaunchDarkly or Unleash.
    return this.flags.get(flagKey) ?? false;
  }

  async getVariant(flagKey: string, context?: any): Promise<string | undefined> {
    return this.variants.get(flagKey);
  }
}
