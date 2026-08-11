export interface VaultSecret {
  reference: string;
  value: string;
  version: number;
}

export interface VaultEngine {
  storeSecret(reference: string, value: string, version: number): Promise<void>;
  retrieveSecret(reference: string, version?: number): Promise<string | undefined>;
  deleteSecret(reference: string): Promise<void>;
}

export class InMemoryVaultEngine implements VaultEngine {
  private store = new Map<string, VaultSecret[]>();

  async storeSecret(reference: string, value: string, version: number): Promise<void> {
    const versions = this.store.get(reference) || [];
    versions.push({ reference, value, version });
    this.store.set(reference, versions);
  }

  async retrieveSecret(reference: string, version?: number): Promise<string | undefined> {
    const versions = this.store.get(reference);
    if (!versions || versions.length === 0) return undefined;

    if (version !== undefined) {
      const match = versions.find(v => v.version === version);
      return match?.value;
    }

    // Return latest
    return versions.sort((a, b) => b.version - a.version)[0].value;
  }

  async deleteSecret(reference: string): Promise<void> {
    this.store.delete(reference);
  }
}
