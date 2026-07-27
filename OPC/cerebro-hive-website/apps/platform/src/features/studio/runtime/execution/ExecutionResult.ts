/**
 * M24 — Unified Execution Result
 *
 * Every executor returns ExecutionResult<T> rather than a bare TypedValue.
 * Future executors gain observability, warnings, and cost tracking for free.
 */
import { DataType } from '../../compiler/types/TypeSystem';

export type ExecutionStatus = 'completed' | 'error' | 'cancelled' | 'skipped' | 'timeout' | 'streaming';

export interface StreamChunk {
  index: number;
  delta: string;
  isFinal: boolean;
}

export interface ExecutionResult<T = unknown> {
  /** The produced value. */
  value: T;
  /** Inferred or declared type. */
  type: DataType;
  /** Terminal status of this execution step. */
  status: ExecutionStatus;
  /** Wall-clock duration (ms). */
  durationMs: number;
  /** USD cost of this node execution (if known). */
  costUsd?: number;
  /** Token usage (LLM nodes). */
  tokenUsage?: { prompt: number; completion: number; total: number };
  /** Non-fatal warnings the executor wants to surface. */
  warnings?: string[];
  /** Arbitrary metadata (provider name, model, version, etc.). */
  metadata?: Record<string, unknown>;
  /** Stream iterator for streaming-capable nodes (e.g. LLM). */
  stream?: AsyncIterable<StreamChunk>;
}

/** Convenience factory for successful results. */
export function ok<T>(value: T, type: DataType, extras: Partial<ExecutionResult<T>> = {}): ExecutionResult<T> {
  return { value, type, status: 'completed', durationMs: 0, ...extras };
}

/** Convenience factory for error results. */
export function errResult<T>(type: DataType, message: string): ExecutionResult<T> {
  return { value: undefined as unknown as T, type, status: 'error', durationMs: 0, warnings: [message] };
}
