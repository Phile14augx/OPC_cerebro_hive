/**
 * Local execution backend — ADR 0013 (D2), ADR 0009 (D4).
 *
 * Runs tools as child processes on the host. This is the development and CI
 * backend; production uses Kubernetes with gVisor.
 *
 * The important property: it implements the *same* `ExecutionProvider` contract
 * as the sandboxed backends, so the pipeline above it cannot tell the
 * difference. Swapping to Docker/gVisor is a construction change, not a
 * redesign — which is the whole reason the contract exists.
 *
 * It is deliberately NOT a fake. It really spawns processes, really streams
 * logs, really collects outputs, and really classifies failures. What it does
 * not do is isolate, and it says so loudly.
 */

import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

import type {
  BackendCapabilities,
  BackendJobRef,
  ExecutionProvider,
  ExecutionResult,
  ExecutionSpec,
  LogChunk,
  ResourceUsage,
} from './execution-provider.js';

export interface LocalBackendOptions {
  /** Root under which each job gets an isolated workspace directory. */
  readonly workRoot: string;
  /**
   * Acknowledgement that this backend provides NO isolation.
   *
   * ADR 0013 permits runc-equivalent execution only for first-party signed
   * images in single-tenant deployments. A local child process is weaker still.
   * Requiring an explicit flag means nobody reaches production on this backend
   * by forgetting to configure one — they have to have typed the words.
   */
  readonly acknowledgeNoIsolation: true;
}

export class LocalExecutionProvider implements ExecutionProvider {
  readonly backendName = 'local';

  readonly #opts: LocalBackendOptions;
  readonly #jobs = new Map<string, LocalJobState>();

  constructor(opts: LocalBackendOptions) {
    if (opts.acknowledgeNoIsolation !== true) {
      throw new Error(
        'LocalExecutionProvider provides no isolation and must be constructed with ' +
          'acknowledgeNoIsolation: true (ADR 0013).',
      );
    }
    this.#opts = opts;
  }

  capabilities(): BackendCapabilities {
    return {
      supportsArrayJobs: false,
      supportsGpu: false,
      maxWallclockSec: 3600,
      // Honest: this backend cannot deliver any sandbox runtime. The scheduler
      // must not route a job that declares gvisor/kata here.
      sandboxRuntimes: [],
    };
  }

  async submit(spec: ExecutionSpec): Promise<BackendJobRef> {
    if (spec.sandbox.runtime !== 'runc') {
      // Fail at submission rather than silently running unisolated. A job
      // requiring gVisor that quietly ran on bare host would be the worst
      // possible outcome of a misconfiguration.
      throw new Error(
        `LocalExecutionProvider cannot honour sandbox runtime "${spec.sandbox.runtime}". ` +
          'Route this job to a backend that supports it (ADR 0013).',
      );
    }

    const workspace = join(this.#opts.workRoot, spec.jobId);
    await mkdir(join(workspace, 'out'), { recursive: true });

    // Stage declared inputs so the tool sees the paths it was promised.
    for (const input of spec.inputs) {
      const target = join(workspace, input.path.replace(/^\/work\//, ''));
      await mkdir(join(target, '..'), { recursive: true });
      const source = spec.env[`ARTIFACT_${input.artifactId}`];
      if (source) await writeFile(target, await readFile(source));
    }

    const state: LocalJobState = {
      spec,
      workspace,
      logs: [],
      startedAt: Date.now(),
      result: null,
      cancelled: false,
    };
    this.#jobs.set(spec.jobId, state);
    state.promise = this.#run(state);
    return { backend: this.backendName, nativeId: spec.jobId };
  }

  async #run(state: LocalJobState): Promise<void> {
    const { spec, workspace } = state;
    const [file, ...args] = spec.command.map((c) => c.replaceAll('/work', workspace));

    await new Promise<void>((resolve) => {
      const child = spawn(file as string, args, {
        cwd: workspace,
        env: { ...spec.env, WORKSPACE: workspace },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let offset = 0;
      const capture = (stream: 'stdout' | 'stderr') => (buf: Buffer) => {
        const data = buf.toString('utf8');
        state.logs.push({ offset, stream, data });
        offset += data.length;
      };
      child.stdout.on('data', capture('stdout'));
      child.stderr.on('data', capture('stderr'));

      const timer = setTimeout(() => {
        state.timedOut = true;
        child.kill('SIGKILL');
      }, spec.timeoutSec * 1000);

      child.on('error', (err) => {
        clearTimeout(timer);
        // Failure to spawn is INFRASTRUCTURE: the tool never ran, so we never
        // learned what it would say (ADR 0009).
        state.result = {
          kind: 'infrastructure',
          reason: err.message.includes('ENOENT') ? 'submission-rejected' : 'backend-unreachable',
          retryable: true,
        };
        resolve();
      });

      child.on('close', (code, signal) => {
        clearTimeout(timer);
        if (state.result) return resolve();

        const usage: ResourceUsage = {
          cpuSeconds: (Date.now() - state.startedAt) / 1000,
          peakMemoryBytes: 0,
          wallclockSeconds: (Date.now() - state.startedAt) / 1000,
        };

        if (state.cancelled) {
          state.result = { kind: 'infrastructure', reason: 'node-evicted', retryable: true };
        } else if (state.timedOut) {
          // A timeout is a domain outcome: the tool ran and did not finish in the
          // budget it was given. Retrying gives the same answer more slowly.
          state.result = { kind: 'outcome', exitCode: 124, usage };
        } else if (signal && !code) {
          state.result = { kind: 'outcome', exitCode: 128 + signalNumber(signal), usage };
        } else {
          // THE central line. Any exit code — including 1, 137, 139 — means the
          // tool ran and reached a conclusion. That is an outcome, never an
          // activity failure (ADR 0009).
          state.result = { kind: 'outcome', exitCode: code ?? 0, usage };
        }
        resolve();
      });
    });
  }

  async status(ref: BackendJobRef): Promise<ExecutionResult | { readonly kind: 'running' }> {
    const state = this.#jobs.get(ref.nativeId);
    if (!state) return { kind: 'infrastructure', reason: 'backend-unreachable', retryable: true };
    if (!state.result) return { kind: 'running' };
    return state.result;
  }

  /** Blocks until the job settles. Convenience for synchronous callers and tests. */
  async wait(ref: BackendJobRef): Promise<ExecutionResult> {
    const state = this.#jobs.get(ref.nativeId);
    if (!state) return { kind: 'infrastructure', reason: 'backend-unreachable', retryable: true };
    await state.promise;
    return state.result ?? { kind: 'infrastructure', reason: 'backend-unreachable', retryable: true };
  }

  async *logs(ref: BackendJobRef, fromOffset: number): AsyncIterable<LogChunk> {
    const state = this.#jobs.get(ref.nativeId);
    if (!state) return;
    for (const chunk of state.logs) {
      if (chunk.offset >= fromOffset) yield chunk;
    }
  }

  async cancel(ref: BackendJobRef): Promise<void> {
    const state = this.#jobs.get(ref.nativeId);
    if (state) state.cancelled = true;
  }

  /**
   * Collect declared outputs, content-addressed.
   *
   * Hashing here rather than at registration means the artifact identity is
   * fixed at the moment of production, before anything can rewrite the file.
   */
  async collectOutputs(ref: BackendJobRef): Promise<CollectedArtifact[]> {
    const state = this.#jobs.get(ref.nativeId);
    if (!state) return [];
    const outDir = join(state.workspace, 'out');
    const collected: CollectedArtifact[] = [];
    for (const name of (await readdir(outDir).catch(() => [])) as string[]) {
      const path = join(outDir, name);
      if (!(await stat(path)).isFile()) continue;
      const bytes = await readFile(path);
      collected.push({
        logicalPath: relative(state.workspace, path).replaceAll('\\', '/'),
        absolutePath: path,
        sizeBytes: bytes.length,
        // ADR 0011 specifies BLAKE3. Node has no built-in BLAKE3, so this build
        // uses SHA-256 with the same `b3:`-shaped prefix replaced by `sha256:`
        // to avoid claiming an algorithm it does not use. Adding the blake3
        // dependency is tracked as a Phase 1 follow-up — see PIPELINE.md.
        contentHash: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
      });
    }
    return collected;
  }
}

export interface CollectedArtifact {
  readonly logicalPath: string;
  readonly absolutePath: string;
  readonly sizeBytes: number;
  readonly contentHash: string;
}

interface LocalJobState {
  spec: ExecutionSpec;
  workspace: string;
  logs: LogChunk[];
  startedAt: number;
  result: ExecutionResult | null;
  cancelled: boolean;
  timedOut?: boolean;
  promise?: Promise<void>;
}

function signalNumber(signal: NodeJS.Signals): number {
  const map: Record<string, number> = { SIGHUP: 1, SIGINT: 2, SIGKILL: 9, SIGSEGV: 11, SIGTERM: 15 };
  return map[signal] ?? 0;
}
