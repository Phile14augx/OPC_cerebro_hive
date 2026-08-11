/**
 * Execution provider contract — ADR 0013 (D2), ADR 0009 (D4).
 *
 * Two orthogonal choices live behind this interface:
 *   backend  — where the job runs (Kubernetes, Slurm, LSF, local)
 *   sandbox  — how strongly it is isolated (gVisor, Kata, runc)
 *
 * Keeping them separate matters because they vary independently: a customer's
 * Slurm farm and our Kubernetes cluster both need gVisor-equivalent isolation,
 * and both may be asked for Kata by an ITAR customer.
 */

import type { ArtifactId, JobId, PdkId } from '@cerebro/eda-domain';

export type SandboxRuntime = 'gvisor' | 'kata' | 'runc';

export interface SandboxPolicy {
  readonly runtime: SandboxRuntime;
  /**
   * Default is `'none'`. Design tools have no legitimate egress need, and denying
   * it removes an entire exfiltration class (Blueprint §10.1). Adapters needing
   * licence-daemon access declare narrow exceptions.
   */
  readonly network: 'none' | { readonly allow: readonly NetworkException[] };
  readonly readOnlyRoot: boolean;
  readonly userNamespace: boolean;
  readonly seccomp: 'strict' | 'runtime-default';
  /** Runners receive no long-lived credentials; a compromise cannot pivot. */
  readonly serviceAccountToken: false;
}

export interface NetworkException {
  readonly reason: 'licence-daemon' | 'artifact-upload' | 'status-callback';
  /** Resolved to an IP by the control plane. No DNS egress — it is an exfil channel. */
  readonly host: string;
  readonly port: number;
}

export interface ExecutionSpec {
  readonly jobId: JobId;
  readonly tool: { readonly name: string; readonly version: string; readonly imageDigest: string };
  readonly pdk?: { readonly id: PdkId; readonly mount: string };
  readonly command: readonly string[];
  readonly env: Readonly<Record<string, string>>;
  readonly inputs: readonly { readonly artifactId: ArtifactId; readonly path: string }[];
  readonly outputs: readonly { readonly glob: string }[];
  readonly resources: {
    readonly cpu: string;
    readonly memory: string;
    readonly gpu: number;
    readonly ephemeralStorage: string;
  };
  readonly licences: readonly { readonly feature: string; readonly tokens: number }[];
  readonly timeoutSec: number;
  readonly seed?: number;
  readonly sandbox: SandboxPolicy;
}

export interface BackendJobRef {
  readonly backend: string;
  readonly nativeId: string;
}

/**
 * Terminal state of an execution.
 *
 * Note `outcome` vs `infrastructure` — this distinction is the one ADR 0009
 * calls out as most easily botched. A tool exiting non-zero because the design
 * does not route is a domain OUTCOME: the activity succeeded in running the tool.
 * Only `infrastructure` failures are retryable. Conflating them makes the
 * workflow engine retry a 40-hour deterministic failure five times.
 */
export type ExecutionResult =
  | { readonly kind: 'outcome'; readonly exitCode: number; readonly usage: ResourceUsage }
  | { readonly kind: 'infrastructure'; readonly reason: InfraFailure; readonly retryable: true };

export type InfraFailure =
  | 'backend-unreachable'
  | 'submission-rejected'
  | 'node-evicted'
  | 'image-pull-failed'
  | 'sandbox-unsupported-syscall';

export interface ResourceUsage {
  readonly cpuSeconds: number;
  readonly peakMemoryBytes: number;
  readonly wallclockSeconds: number;
}

export interface LogChunk {
  readonly offset: number;
  readonly stream: 'stdout' | 'stderr';
  readonly data: string;
}

export interface BackendCapabilities {
  readonly supportsArrayJobs: boolean;
  readonly supportsGpu: boolean;
  readonly maxWallclockSec: number;
  readonly sandboxRuntimes: readonly SandboxRuntime[];
}

export interface ExecutionProvider {
  readonly backendName: string;
  submit(spec: ExecutionSpec): Promise<BackendJobRef>;
  status(ref: BackendJobRef): Promise<ExecutionResult | { readonly kind: 'running' }>;
  logs(ref: BackendJobRef, fromOffset: number): AsyncIterable<LogChunk>;
  cancel(ref: BackendJobRef): Promise<void>;
  capabilities(): BackendCapabilities;
}

/**
 * Advisory licence accounting — Blueprint §8.4.
 *
 * The vendor daemon remains authoritative. Modelling claims lets the scheduler
 * avoid submitting jobs that will immediately fail checkout, which is the actual
 * pain: 200 queued jobs thrashing against 30 licences.
 */
export interface LicenceBroker {
  /** Redis-backed lease. A dead runner's lease expires and tokens return to the pool. */
  acquire(feature: string, tokens: number, leaseSec: number): Promise<LicenceClaim | null>;
  heartbeat(claim: LicenceClaim): Promise<void>;
  release(claim: LicenceClaim): Promise<void>;
}

export interface LicenceClaim {
  readonly claimId: string;
  readonly feature: string;
  readonly tokens: number;
  readonly expiresAt: Date;
}
