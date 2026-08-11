/**
 * Workflow façade — ADR 0009 (D4).
 *
 * THIS PACKAGE IS THE ONLY PLACE PERMITTED TO IMPORT `@temporalio/*`.
 * Enforced by `.dependency-cruiser.js` rule `eda-temporal-containment`
 * and by `no-restricted-imports` in `.eslintrc.eda.json`.
 *
 * This is not an abstraction pretending Temporal is swappable. It is a seam that
 * keeps the blast radius of a future change measurable: ADR 0009 accepts the
 * dependency deliberately, and bounds the exit cost by ensuring (a) durable state
 * is mirrored into our own Postgres and Kafka, (b) activities are thin, and
 * (c) this file is the only import site.
 */

import type { FlowRunId, JobId } from '@cerebro/eda-domain';

export interface WorkflowEngine {
  start<I>(def: FlowDefinitionRef, input: I, opts: StartOptions): Promise<WorkflowHandle>;
  signal<P>(runId: FlowRunId, signal: string, payload: P): Promise<void>;
  cancel(runId: FlowRunId, reason: string): Promise<void>;
  describe(runId: FlowRunId): Promise<WorkflowStatus>;
}

export interface FlowDefinitionRef {
  readonly name: string;
  /**
   * Long-running flows outlive deploys. A run started under v1 that is still
   * executing when v2 ships must be patched explicitly, never silently migrated
   * (ADR 0009, Migration Strategy).
   */
  readonly version: number;
}

export interface StartOptions {
  readonly runId: FlowRunId;
  readonly taskQueue: string;
  readonly correlationId: string;
  /** Namespace per tenant — ADR 0010 resolves ADR 0009's open question 2. */
  readonly namespace: string;
}

export interface WorkflowHandle {
  readonly runId: FlowRunId;
  result(): Promise<unknown>;
}

export type WorkflowStatus =
  | { readonly state: 'running'; readonly currentStage?: string }
  | { readonly state: 'waiting'; readonly waitingOn: 'approval' | 'licence' | 'job'; readonly since: Date }
  | { readonly state: 'completed' }
  | { readonly state: 'failed'; readonly reason: string }
  | { readonly state: 'cancelled' };

/**
 * Activities are the only place side effects may occur. Workflow bodies must be
 * deterministic — no clocks, no randomness, no I/O — or they fail on replay,
 * usually long after the change that caused it.
 */
export interface ActivityContext {
  readonly jobId: JobId;
  /** Renews resource leases and reports liveness for long-running work. */
  heartbeat(details?: unknown): void;
  readonly cancellationSignal: AbortSignal;
}

/**
 * Token for async activity completion.
 *
 * A 40-hour P&R job does not block an activity thread: the activity returns this
 * token, it is stored on the Job row, and the event consumer completes it when
 * `job.completed` arrives. No polling loops, no orphaned state.
 */
export type ActivityToken = string & { readonly __activityToken: unique symbol };

export interface AsyncActivityCompleter {
  complete(token: ActivityToken, result: unknown): Promise<void>;
  fail(token: ActivityToken, reason: string): Promise<void>;
}
