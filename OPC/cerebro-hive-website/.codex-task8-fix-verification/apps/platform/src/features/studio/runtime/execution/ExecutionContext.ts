/**
 * M24 — ExecutionContext (Service Container)
 *
 * The single object threaded through every executor, plugin, and middleware call.
 * Acts as a service container — eliminates ever-growing function argument lists.
 * Everything is lazily-resolvable via get<T>() for future DI extensibility.
 */
import { StudioGraph } from '../../graph/GraphModel';
import { ExecutionPlan } from '../../compiler/ir/ExecutionPlan';
import { CompilationContext } from '../../compiler/engine/CompilationContext';
import { ExecutionResources, ResourceBudget } from './ExecutionResources';
import { DefaultExecutionMetrics, ExecutionMetrics } from './ExecutionMetrics';
import { ExecutionTrace } from './ExecutionTrace';
import { SimulationMode, DEFAULT_SIMULATION_MODE } from './SimulationMode';

// ── Simple in-process stores ─────────────────────────────────────────────────

export interface KeyValueStore {
  read(key: string): unknown;
  write(key: string, value: unknown): void;
  keys(): string[];
  clear(): void;
}

class InMemoryKVStore implements KeyValueStore {
  private store: Map<string, unknown> = new Map();
  read(key: string): unknown { return this.store.get(key); }
  write(key: string, value: unknown): void { this.store.set(key, value); }
  keys(): string[] { return Array.from(this.store.keys()); }
  clear(): void { this.store.clear(); }
}

// ── CancellationToken ─────────────────────────────────────────────────────────

export class CancellationToken {
  private _cancelled = false;
  get isCancelled(): boolean { return this._cancelled; }
  cancel(): void { this._cancelled = true; }
  /** Cooperative interrupt — call this periodically in long-running executors. */
  throwIfCancelled(): void {
    if (this._cancelled) throw new Error('Execution was cancelled');
  }
}

// ── ExecutionContext ──────────────────────────────────────────────────────────

export interface ExecutionContextOptions {
  graph: StudioGraph;
  executionPlan: ExecutionPlan;
  compilationContext: CompilationContext;
  simulationMode?: SimulationMode;
  resourceBudget?: Partial<ResourceBudget>;
  logger?: (...args: unknown[]) => void;
}

export class ExecutionContext {
  readonly executionId: string;
  readonly graph: StudioGraph;
  readonly executionPlan: ExecutionPlan;
  readonly compilationContext: CompilationContext;

  // Services (injectable / replaceable for testing)
  readonly metrics: ExecutionMetrics;
  readonly resources: ExecutionResources;
  readonly trace: ExecutionTrace;
  readonly memoryStore: KeyValueStore;
  readonly variableStore: KeyValueStore;
  readonly cancellationToken: CancellationToken;
  readonly simulationMode: SimulationMode;
  readonly logger: (...args: unknown[]) => void;

  // Generic service container for plugins / future DI
  private services: Map<string, unknown> = new Map();

  constructor(opts: ExecutionContextOptions) {
    this.executionId = crypto.randomUUID();
    this.graph = opts.graph;
    this.executionPlan = opts.executionPlan;
    this.compilationContext = opts.compilationContext;
    this.simulationMode = opts.simulationMode ?? DEFAULT_SIMULATION_MODE;
    this.logger = opts.logger ?? ((...a) => console.log('[Studio]', ...a));

    this.metrics = new DefaultExecutionMetrics(this.executionId);
    this.resources = new ExecutionResources(opts.resourceBudget);
    this.trace = new ExecutionTrace(this.executionId);
    this.memoryStore = new InMemoryKVStore();
    this.variableStore = new InMemoryKVStore();
    this.cancellationToken = new CancellationToken();
  }

  // ── Service container ────────────────────────────────────────────────────

  provide<T>(key: string, service: T): void { this.services.set(key, service); }
  get<T>(key: string): T | undefined { return this.services.get(key) as T | undefined; }

  // ── Convenience ──────────────────────────────────────────────────────────

  get isCancelled(): boolean { return this.cancellationToken.isCancelled; }
  cancel(): void { this.cancellationToken.cancel(); }
}
