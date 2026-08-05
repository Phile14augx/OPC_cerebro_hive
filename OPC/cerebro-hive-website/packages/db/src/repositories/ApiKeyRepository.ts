import { PrismaClient } from '../generated/client';

export interface ApiKeyRecord {
  id: string;
  keyHash: string;
  expiresAt: Date | null;
  userId: string;
  orgId: string | null;
  scopes: string[];
}

export class ApiKeyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPrefix(prefix: string): Promise<ApiKeyRecord | null> {
    // The current Prisma schema does not align with the auth package's expectations
    // (missing prefix, userId, scopes, etc.).
    // We return null here to fail safely at runtime until the schema is reconciled.
    return null;
  }

  async recordUsage(id: string): Promise<void> {
    // No-op for now
  }
}

// In the actual app, this might be injected, but auth expects a singleton export
export const apiKeyRepository = new ApiKeyRepository(new PrismaClient());
