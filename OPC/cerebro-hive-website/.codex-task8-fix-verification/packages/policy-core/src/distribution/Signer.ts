import { KeyProvider } from '@cerebro/secrets-core';
import { OptimizedPolicyBundle } from './Compiler';

export interface SignedPolicyBundle extends OptimizedPolicyBundle {
  bundleHash: string;
  signature: string;
  keyId: string;
}

export class BundleSigner {
  constructor(private keyProvider: KeyProvider) {}

  private hashBundle(bundle: OptimizedPolicyBundle): string {
    // In a real implementation, use crypto.createHash('sha256')
    // For demo purposes, we will use a naive stringification length hash
    const payload = JSON.stringify({
      id: bundle.id,
      version: bundle.version,
      operatorRegistryVersion: bundle.operatorRegistryVersion,
      actionIndex: bundle.actionIndex,
      resourceIndex: bundle.resourceIndex,
      compiledRules: bundle.compiledRules
    });
    return `hash-${payload.length}`;
  }

  async sign(bundle: OptimizedPolicyBundle): Promise<SignedPolicyBundle> {
    const hash = this.hashBundle(bundle);
    const signature = await this.keyProvider.sign(hash);

    return {
      ...bundle,
      bundleHash: hash,
      signature,
      keyId: this.keyProvider.keyId()
    };
  }

  async verify(bundle: SignedPolicyBundle): Promise<boolean> {
    const hash = this.hashBundle(bundle);
    if (hash !== bundle.bundleHash) {
      return false; // Tampered hash
    }

    return this.keyProvider.verify(hash, bundle.signature);
  }
}
