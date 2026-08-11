import { ArtifactReference } from '../analyzers/models';

export type NetworkPolicy = 'NoNetwork' | 'DNSOnly' | 'AllowListedDomains' | 'AllowListedCIDRs' | 'FullNetwork';
export type SandboxMount = 'ReadOnly' | 'ReadWriteScratch' | 'EphemeralTmpfs' | 'NoFilesystem';
export type SecurityProfile = 'MinimalSandbox' | 'ContainerScanner' | 'RepositoryScanner' | 'IaCScanner' | 'SecretsScanner' | 'Experimental';

export type RuntimeState = 
  | 'Queued'
  | 'Provisioning'
  | 'SandboxCreated'
  | 'ArtifactsMounted'
  | 'Running'
  | 'CollectingOutput'
  | 'Completed'
  | 'CleaningUp'
  | 'Finished';

export interface RuntimeCapability {
  readonly supportsContainers: boolean;
  readonly supportsMicroVMs: boolean;
  readonly supportsTmpfs: boolean;
  readonly supportsNetworkIsolation: boolean;
  readonly supportsCgroups: boolean;
  readonly supportsSnapshots: boolean;
  readonly supportsGPU: boolean;
}

export interface ResourceAccounting {
  readonly cpuUnits: number;
  readonly memoryMb: number;
  readonly timeoutSeconds: number;
}

export interface SandboxMetadata {
  readonly sandboxSessionId: string;
  readonly runtimeId: string;
  readonly runtimeType: string;
  readonly runtimeVersion: string;
  readonly runtimeImplementation: string;
  readonly securityProfileVersion: string;
  readonly securityProfile: SecurityProfile;
  readonly timeline: Record<RuntimeState, number | undefined>; // Immutable timeline of timestamps
  readonly cleanupReport?: CleanupReport;
}

export type CleanupFailureReason = 
  | 'ProcessTerminationFailed'
  | 'UnmountFailed'
  | 'ScratchDeletionFailed'
  | 'Timeout'
  | 'Unknown';

export interface CleanupReport {
  readonly processTerminated: boolean;
  readonly artifactsUnmounted: boolean;
  readonly scratchDeleted: boolean;
  readonly sandboxDestroyed: boolean;
  readonly locksReleased: boolean;
  readonly durationMs: number;
  readonly failureReason?: CleanupFailureReason;
}

export interface ExecutionContext {
  readonly targetArtifacts: readonly ArtifactReference[];
  readonly limits: ResourceAccounting;
  readonly networkPolicy: NetworkPolicy;
  readonly filesystemPolicy: SandboxMount;
  readonly securityProfile: SecurityProfile;
  readonly correlationId: string;
  readonly telemetryContext: Record<string, string>;
  readonly cancellationToken?: AbortSignal;
}

export interface SandboxExecutionResult {
  readonly metadata: SandboxMetadata;
  readonly exitCode: number;
  readonly requestedResources: ResourceAccounting;
  readonly enforcedResources: ResourceAccounting;
  readonly actualResources: ResourceAccounting;
  readonly rawOutputSize: number;
}

export interface IRuntimeHealthProvider {
  getHealth(): 'healthy' | 'degraded' | 'offline' | 'maintenance';
}
