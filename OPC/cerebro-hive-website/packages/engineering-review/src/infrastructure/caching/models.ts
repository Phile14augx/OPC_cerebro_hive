import { AnalyzerResult } from '../analyzers/models';

export interface ArtifactFingerprint {
  readonly algorithm: string;
  readonly version: string;
  readonly digest: string;
}

export interface ExecutionCacheKey {
  readonly tenantId: string;
  readonly repositoryId: string;
  readonly analyzerId: string;
  readonly analyzerVersion: string;
  readonly artifactFingerprint: ArtifactFingerprint;
}

export interface CacheMetadata {
  readonly executionId: string;
  readonly analyzerVersion: string;
  readonly runtimeVersion: string;
  readonly generatedAt: number;
  readonly executionDurationMs: number;
  readonly cacheSource: string; // e.g. "PrimaryCluster", "DistributedCache"
}

export interface CacheEntry {
  readonly cacheKey: ExecutionCacheKey;
  readonly result: AnalyzerResult;
  readonly createdAt: number;
  readonly expiresAt?: number;
  readonly metadata: CacheMetadata;
  readonly resourceUsage: Record<string, number>;
  readonly schemaVersion: string;
}

export interface CachePolicy {
  readonly ttlMs?: number;
  readonly forceRefresh: boolean;
  readonly neverCache: boolean;
  readonly cacheErrors: boolean;
}

export interface ExecutionOptions {
  readonly bypassCache: boolean;
  readonly refreshCache: boolean;
  readonly useCacheOnly: boolean;
}

export type CacheValidationDecision = 'Valid' | 'Expired' | 'Invalid' | 'SchemaMismatch' | 'PolicyMismatch';

export type ExecutionReuseDecisionType = 'Execute' | 'ReuseCachedResult' | 'ForceRefresh' | 'Skip';

export interface ExecutionReuseDecision {
  readonly decision: ExecutionReuseDecisionType;
  readonly reason: string;
  readonly cacheKey?: ExecutionCacheKey;
  readonly originalExecutionId?: string;
  readonly analyzerVersion?: string;
  readonly ageMs?: number;
  readonly savedDurationMs?: number;
}

export interface CacheSnapshot {
  readonly generatedAt: number;
  readonly nodeDecisions: Record<string, ExecutionReuseDecision>; // Maps nodeId -> decision
}
