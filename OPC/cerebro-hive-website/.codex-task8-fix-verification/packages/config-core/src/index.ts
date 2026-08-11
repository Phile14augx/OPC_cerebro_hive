import { z } from 'zod';

export interface ConfigLoader {
  load(): Record<string, any>;
  get<T>(key: string): T;
  has(key: string): boolean;
}

export class EnvironmentConfigLoader implements ConfigLoader {
  private config: Record<string, string | undefined>;

  constructor() {
    this.config = process.env;
  }

  load() {
    return this.config;
  }

  get<T>(key: string): T {
    const value = this.config[key];
    if (value === undefined) {
      throw new Error(`Configuration key missing: ${key}`);
    }
    return value as unknown as T;
  }

  has(key: string): boolean {
    return this.config[key] !== undefined;
  }
}

export class ConfigManager {
  private loader: ConfigLoader;

  constructor(loader?: ConfigLoader) {
    this.loader = loader || new EnvironmentConfigLoader();
  }

  get(key: string, defaultValue?: string): string {
    try {
      return this.loader.get<string>(key);
    } catch (e) {
      if (defaultValue !== undefined) return defaultValue;
      throw e;
    }
  }

  getFeatureFlag(flag: string): boolean {
    const val = this.get(`FEATURE_${flag.toUpperCase()}`, 'false');
    return val === 'true' || val === '1';
  }
}
