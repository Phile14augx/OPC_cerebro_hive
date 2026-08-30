import { ITransformer, TransformerContext } from './ITransformer';
import { TransformerPipeline, PipelineResult } from './ITransformerPipeline';

/**
 * Tenant context used to scope transformer execution.
 * Every tenant gets its own isolated namespace within the engine.
 */
export interface TenantContext {
  /** Unique tenant identifier. */
  tenantId: string;
  /** Optional plan/tier label (e.g. "free", "pro", "enterprise"). */
  plan?: string;
  /** Arbitrary tenant-level metadata passed into every TransformerContext. */
  metadata?: Record<string, unknown>;
}

/**
 * Extended engine interface for L3 capabilities:
 *   - Lifecycle management (load / unload)
 *   - Pipeline execution
 *   - Tenant-isolated execute
 */
export interface ITransformerEngineL3 {
  // ── Lifecycle ────────────────────────────────────────────────────────────
  /**
   * Register and **load** a transformer (calls onLoad if implemented).
   * Throws if a transformer with the same name is already loaded.
   */
  loadTransformer(transformer: ITransformer): Promise<void>;

  /**
   * Unload and unregister a transformer (calls onUnload if implemented).
   * No-op if the transformer is not registered.
   */
  unloadTransformer(transformerName: string): Promise<void>;

  /** Returns the current lifecycle state of a transformer. */
  getTransformerState(transformerName: string): 'unloaded' | 'loading' | 'loaded' | 'unloading' | 'error';

  /** Returns the names of all currently loaded transformers. */
  listTransformers(): string[];

  // ── Pipeline ─────────────────────────────────────────────────────────────
  /**
   * Register a named pipeline (ordered list of transformer steps).
   */
  registerPipeline(pipeline: TransformerPipeline): void;

  /**
   * Execute a registered pipeline.
   * Each step's output is passed as the next step's input.
   */
  executePipeline<TInput, TFinal>(
    pipelineName: string,
    input: TInput,
    context?: Partial<TransformerContext>,
  ): Promise<PipelineResult<TFinal>>;

  // ── Tenant Isolation ─────────────────────────────────────────────────────
  /**
   * Execute a single transformer scoped to a tenant.
   * The tenant's metadata is merged into the TransformerContext.
   */
  executeForTenant<TInput, TOutput>(
    transformerName: string,
    input: TInput,
    tenant: TenantContext,
    context?: Partial<TransformerContext>,
  ): Promise<TOutput>;

  /**
   * Execute a pipeline scoped to a tenant.
   */
  executePipelineForTenant<TInput, TFinal>(
    pipelineName: string,
    input: TInput,
    tenant: TenantContext,
    context?: Partial<TransformerContext>,
  ): Promise<PipelineResult<TFinal>>;
}
