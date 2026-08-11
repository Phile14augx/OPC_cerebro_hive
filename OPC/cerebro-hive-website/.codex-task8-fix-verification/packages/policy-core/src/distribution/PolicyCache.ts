import { SignedPolicyBundle, BundleSigner } from './Signer';

export interface PolicyCache {
  getActiveBundle(): SignedPolicyBundle | undefined;
  loadBundle(bundle: SignedPolicyBundle): Promise<void>;
}

export class InMemoryPolicyCache implements PolicyCache {
  private activeBundle?: SignedPolicyBundle;
  
  constructor(private signer: BundleSigner) {}

  getActiveBundle(): SignedPolicyBundle | undefined {
    return this.activeBundle;
  }

  async loadBundle(candidateBundle: SignedPolicyBundle): Promise<void> {
    // 1. Verify Signature on Load
    const isValid = await this.signer.verify(candidateBundle);
    if (!isValid) {
      throw new Error(`[PolicyCache] Bundle signature verification failed for bundle ${candidateBundle.id}`);
    }

    // 2. Compatibility Checks
    if (this.activeBundle && candidateBundle.operatorRegistryVersion !== this.activeBundle.operatorRegistryVersion) {
      console.warn(`[PolicyCache] Operator registry version changed from ${this.activeBundle.operatorRegistryVersion} to ${candidateBundle.operatorRegistryVersion}`);
      // In a real system, verify if the ConditionEngine supports the new version before swapping.
    }

    // 3. Atomic Swap
    // Because JS is single-threaded, simply reassigning the reference is atomic.
    // Any inflight requests using the old reference will complete with the old bundle.
    // New requests will use the new bundle.
    this.activeBundle = candidateBundle;
    
    console.log(`[PolicyCache] Successfully loaded and activated bundle ${candidateBundle.id} (v${candidateBundle.version})`);
  }
}
