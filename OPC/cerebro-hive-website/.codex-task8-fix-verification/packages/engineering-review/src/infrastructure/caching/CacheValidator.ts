import { CacheEntry, CacheValidationDecision } from './models';

export class CacheValidator {
  constructor(private readonly expectedSchemaVersion: string) {}

  validate(entry: CacheEntry, currentTimeMs: number = Date.now()): CacheValidationDecision {
    if (entry.schemaVersion !== this.expectedSchemaVersion) {
      return 'SchemaMismatch';
    }

    if (entry.expiresAt && entry.expiresAt < currentTimeMs) {
      return 'Expired';
    }

    return 'Valid';
  }
}
