/**
 * Storage contract — ADR 0011 (D9), Blueprint §3.1 (data gravity).
 *
 * Artifacts are never pulled through application services. Services exchange
 * references and presigned URLs; bytes move directly between the runner and
 * object storage.
 */

import type { BlobId, ExportClass, VerifiedTenantContext } from '@cerebro/eda-domain';

export type StorageTier = 'hot' | 'warm' | 'cold';

export interface BlobDescriptor {
  readonly blobId: BlobId;
  readonly sizeBytes: number;
  readonly tier: StorageTier;
  readonly exportClass: ExportClass;
}

export interface StorageProvider {
  /**
   * Bucket-per-tenant with a per-tenant KMS key (ADR 0010). A path-construction
   * bug must not be sufficient to leak — hence physical separation here even
   * though Postgres uses shared-schema RLS.
   */
  presignRead(ctx: VerifiedTenantContext, blobId: BlobId, ttlSec: number): Promise<string>;
  /** Scoped to this job's paths only, short TTL. A compromised runner cannot enumerate storage. */
  presignWrite(ctx: VerifiedTenantContext, key: string, ttlSec: number): Promise<string>;
  head(ctx: VerifiedTenantContext, blobId: BlobId): Promise<BlobDescriptor | null>;
  /** Content-addressed: two runs producing identical GDS store one blob. */
  register(ctx: VerifiedTenantContext, blobId: BlobId, sizeBytes: number, ec: ExportClass): Promise<void>;
  tier(ctx: VerifiedTenantContext, blobId: BlobId, to: StorageTier): Promise<void>;
}
