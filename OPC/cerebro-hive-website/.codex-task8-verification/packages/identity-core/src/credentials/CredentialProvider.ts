export interface CredentialProvider {
  validatePassword(principalId: string, passwordHash: string): Promise<boolean>;
  validateApiKey(apiKey: string): Promise<string | null>; // Returns principalId if valid
  validateOAuthToken(token: string): Promise<string | null>;
}
