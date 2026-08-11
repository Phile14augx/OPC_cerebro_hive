export type AnalyzerProfile = 'StaticCode' | 'IaC' | 'Container' | 'Dependency' | 'SBOM' | 'SecretDetection' | 'Architecture';

export type ArtifactType = 'source_code' | 'container_image' | 'cloudformation' | 'terraform' | 'package_lock';

/**
 * Defines what an analyzer can do and what it requires.
 */
export interface IAnalyzerCapability {
  readonly analyzerId: string;
  readonly displayName: string;
  readonly version: string;
  readonly profile: AnalyzerProfile;
  readonly supportedArtifactTypes: readonly ArtifactType[];
  readonly supportedSchemaVersions: readonly string[];
  readonly resourceRequirements: {
    readonly minMemoryMb?: number;
    readonly maxMemoryMb?: number;
    readonly maxTimeoutSeconds?: number;
  };
}

/**
 * Manifest containing detailed compatibility and requirement metadata for an analyzer version.
 */
export interface AnalyzerManifest {
  readonly analyzerId: string;
  readonly analyzerVersion: string;
  readonly supportedSchemaVersions: readonly string[];
  readonly requiredCapabilities: readonly string[];
  readonly compatibilityMetadata: Record<string, string>;
}

/**
 * Storage-agnostic reference to an artifact.
 */
export interface ArtifactReference {
  readonly artifactId: string;
  readonly type: ArtifactType;
  readonly checksum: string; // SHA256
  readonly mediaType: string;
  readonly sizeBytes: number;
  readonly accessMode: 'stream' | 'mount' | 'download';
}

/**
 * Strict resource limits enforced by the runtime sandbox.
 */
export interface ExecutionLimits {
  readonly cpuUnits: number;
  readonly memoryMb: number;
  readonly timeoutSeconds: number;
  readonly diskMb: number;
  readonly networkEgressAllowed: boolean;
  readonly concurrency: number;
  readonly maxRetries: number;
}

/**
 * The request payload dispatched to an adapter for execution.
 */
export interface AnalyzerExecutionRequest {
  readonly executionId: string;
  readonly targetArtifacts: readonly ArtifactReference[];
  readonly limits: ExecutionLimits;
  readonly context: Record<string, any>;
  readonly cancellationToken?: AbortSignal;
}

/**
 * Events tracking the execution lifecycle of an analyzer.
 */
export type AnalyzerLifecycleEvent =
  | 'AnalyzerQueued'
  | 'AnalyzerStarted'
  | 'ArtifactProvisioned'
  | 'AnalyzerCompleted'
  | 'AnalyzerFailed'
  | 'FindingsNormalized';

/**
 * Canonical failure taxonomy.
 */
export type AnalyzerFailureReason =
  | 'AnalyzerUnavailable'
  | 'ArtifactUnavailable'
  | 'UnsupportedArtifact'
  | 'Timeout'
  | 'Cancelled'
  | 'PolicyViolation'
  | 'SandboxFailure'
  | 'AdapterFailure'
  | 'NormalizationFailure'
  | 'InternalFailure';

export class AnalyzerExecutionError extends Error {
  constructor(
    public readonly reason: AnalyzerFailureReason,
    message: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AnalyzerExecutionError';
  }
}

/**
 * A normalized finding conforming to the canonical schema.
 */
export interface CanonicalFinding {
  readonly id: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  readonly confidence: 'high' | 'medium' | 'low';
  readonly category: string;
  readonly message: string;
  readonly filePath?: string;
  readonly lineNumber?: number;
  readonly rawVendorFindingId?: string; // Provenance back to vendor output
}

/**
 * Immutable analyzer result containing canonical findings.
 */
export interface AnalyzerResult {
  readonly executionId: string;
  readonly analyzerId: string;
  readonly version: string;
  readonly status: 'succeeded' | 'failed' | 'skipped';
  readonly findings: readonly CanonicalFinding[];
  readonly durationMs: number;
  readonly failureReason?: AnalyzerFailureReason;
  readonly failureMessage?: string;
  readonly resourceUsage?: {
    readonly executionTimeMs: number;
    readonly peakMemoryMb: number;
    readonly cpuTimeMs: number;
    readonly cacheHitRate?: number;
  };
}
