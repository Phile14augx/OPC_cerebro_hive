export interface ISecretManager {
  getSecret(key: string): Promise<string | undefined>;
  setSecret(key: string, value: string): Promise<void>;
}

export class EnvSecretManager implements ISecretManager {
  async getSecret(key: string): Promise<string | undefined> {
    return process.env[key];
  }

  async setSecret(key: string, value: string): Promise<void> {
    // Cannot set env vars permanently at runtime this way,
    // this would be replaced by HashiCorp Vault or AWS Secrets Manager.
    process.env[key] = value;
  }
}
