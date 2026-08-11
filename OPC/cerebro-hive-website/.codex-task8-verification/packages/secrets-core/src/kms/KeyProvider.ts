export interface KeyProvider {
  keyId(): string;
  sign(payload: string): Promise<string>;
  verify(payload: string, signature: string): Promise<boolean>;
  rotate(): Promise<void>;
  currentKey(): string; // Return public key or key metadata
}

/**
 * A mock implementation for Phase 9.4 until Phase 9.6 fully integrates Vault/KMS.
 */
export class MockKeyProvider implements KeyProvider {
  private activeKeyId: string;
  private seed: number;

  constructor(initialKeyId: string = 'key-v1') {
    this.activeKeyId = initialKeyId;
    this.seed = 42; // deterministic for testing
  }

  keyId(): string {
    return this.activeKeyId;
  }

  currentKey(): string {
    return `public-key-${this.activeKeyId}`;
  }

  async sign(payload: string): Promise<string> {
    // Basic mock signature for demonstration
    const length = payload.length;
    return `mock-sig-${this.activeKeyId}-${length * this.seed}`;
  }

  async verify(payload: string, signature: string): Promise<boolean> {
    const expectedSig = `mock-sig-${this.activeKeyId}-${payload.length * this.seed}`;
    return signature === expectedSig;
  }

  async rotate(): Promise<void> {
    this.activeKeyId = `key-v${Date.now()}`;
  }
}
