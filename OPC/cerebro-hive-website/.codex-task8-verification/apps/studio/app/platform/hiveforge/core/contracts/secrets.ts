/**
 * Platform-wide Secrets Interface
 */

export interface SecretHandle {
  id: string; // UUID handle, not the actual secret
  keyName: string;
  version: string;
  provider: "vault" | "aws-sm" | "azure-kv" | "local";
}

export interface SecretsResolver {
  // Resolves handles dynamically at execution time, never embedded in execution graphs.
  resolveSecret(handle: SecretHandle): Promise<string>;
  storeSecret(keyName: string, value: string, provider?: string): Promise<SecretHandle>;
}
