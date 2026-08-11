export interface FeatureFlags {
  isEnabled(organizationId: string, key: string): Promise<boolean>;
  set(organizationId: string, key: string, enabled: boolean, payload?: unknown): Promise<void>;
  list(organizationId: string): Promise<{ key: string; enabled: boolean; payload?: unknown }[]>;
}

export class InMemoryFeatureFlags implements FeatureFlags {
  private flags = new Map<string, { enabled: boolean; payload?: unknown }>();
  private k(org: string, key: string) { return `${org}:${key}`; }
  async isEnabled(organizationId: string, key: string): Promise<boolean> {
    return this.flags.get(this.k(organizationId, key))?.enabled ?? this.flags.get(this.k("*", key))?.enabled ?? false;
  }
  async set(organizationId: string, key: string, enabled: boolean, payload?: unknown): Promise<void> {
    this.flags.set(this.k(organizationId, key), { enabled, payload });
  }
  async list(organizationId: string): Promise<{ key: string; enabled: boolean; payload?: unknown }[]> {
    const out: { key: string; enabled: boolean; payload?: unknown }[] = [];
    for (const [k, v] of this.flags) {
      const [org, key] = [k.slice(0, k.indexOf(":")), k.slice(k.indexOf(":") + 1)];
      if (org === organizationId || org === "*") out.push({ key, enabled: v.enabled, payload: v.payload });
    }
    return out;
  }
}
