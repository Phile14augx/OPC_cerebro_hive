// ─── P11 Neural Studio — Contracts ───────────────────────────────────────────
// Central type exports consumed by service, client, and test layers.

// ── Tenant ────────────────────────────────────────────────────────────────────

export interface TenantContext {
  readonly tenantId: string;
  readonly userId: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

export interface NeuralStudioConfig {
  apiKey: string;
  endpoint: string;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

export type SessionLifecycleState =
  | 'CREATED'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED';

/** Valid transition map: key → allowed next states */
export const SESSION_TRANSITIONS: Record<SessionLifecycleState, readonly SessionLifecycleState[]> = {
  CREATED:   ['RUNNING', 'ARCHIVED'],
  RUNNING:   ['PAUSED', 'COMPLETED', 'ARCHIVED'],
  PAUSED:    ['RUNNING', 'COMPLETED', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED:  [],
};

// ── Hyperparameters ───────────────────────────────────────────────────────────

export interface HyperparameterConfig {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
  dropout?: number;          // 0–1
  weightDecay?: number;
  customParams?: Record<string, number | string | boolean>;
}

// ── Experiment ────────────────────────────────────────────────────────────────

export interface ExperimentMetrics {
  loss?: number;
  accuracy?: number;
  valLoss?: number;
  valAccuracy?: number;
  custom?: Record<string, number>;
}

export interface Experiment {
  readonly id: string;
  readonly tenantId: string;
  readonly sessionId: string;
  name: string;
  hyperparameters: HyperparameterConfig;
  metrics: ExperimentMetrics;
  readonly createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

// ── Model Session ─────────────────────────────────────────────────────────────

export interface ModelSession {
  readonly id: string;
  readonly tenantId: string;
  readonly createdBy: string;
  name: string;
  description?: string;
  state: SessionLifecycleState;
  hyperparameters?: HyperparameterConfig;
  experimentIds: string[];
  readonly createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// ── Legacy / L2 compatibility ─────────────────────────────────────────────────

/** Kept for backward-compat with L2 tests */
export interface StudioSession {
  id: string;
  status: 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

// ── Errors ────────────────────────────────────────────────────────────────────

export class InvalidTransitionError extends Error {
  constructor(from: SessionLifecycleState, to: SessionLifecycleState) {
    super(`Invalid lifecycle transition: ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

export class TenantIsolationError extends Error {
  constructor(operation: string) {
    super(`TenantContext required for operation: ${operation}`);
    this.name = 'TenantIsolationError';
  }
}

export class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
  }
}

export class ExperimentNotFoundError extends Error {
  constructor(experimentId: string) {
    super(`Experiment not found: ${experimentId}`);
    this.name = 'ExperimentNotFoundError';
  }
}
