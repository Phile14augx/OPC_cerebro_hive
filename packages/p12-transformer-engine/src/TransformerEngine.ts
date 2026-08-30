import { ITransformer, TransformerContext } from './contracts/ITransformer';
import { ITransformerEngine } from './contracts/ITransformerEngine';
import { ITransformerLifecycle, TransformerRegistryEntry, TransformerState } from './contracts/ITransformerLifecycle';
import { TransformerPipeline, PipelineResult, PipelineStepResult } from './contracts/ITransformerPipeline';
import { ITransformerEngineL3, TenantContext } from './contracts/ITransformerEngineL3';

/** Type guard: does this transformer implement lifecycle hooks? */
function hasLifecycle(t: ITransformer): t is ITransformer & ITransformerLifecycle {
  return typeof (t as ITransformerLifecycle).onLoad === 'function'
    || typeof (t as ITransformerLifecycle).onUnload === 'function';
}

/**
 * TransformerEngine – L3 implementation.
 *
 * Implements both the original L1/L2 ITransformerEngine (for backward compat)
 * and the new ITransformerEngineL3 surface that adds:
 *   - Lifecycle management (loadTransformer / unloadTransformer / state)
 *   - Pipeline registration & execution (chained, data-flowing)
 *   - Tenant isolation (tenantId injected into every TransformerContext)
 */
export class TransformerEngine implements ITransformerEngine, ITransformerEngineL3 {

  // ── Internal state ────────────────────────────────────────────────────────

  /** Raw transformer instances, keyed by name. */
  private readonly transformers = new Map<string, ITransformer>();

  /** Registry entries tracking lifecycle state per transformer. */
  private readonly registry = new Map<string, TransformerRegistryEntry>();

  /** Named pipelines registered via registerPipeline(). */
  private readonly pipelines = new Map<string, TransformerPipeline>();

  // ── Helper: build a full TransformerContext ───────────────────────────────

  private buildContext(
    partial?: Partial<TransformerContext>,
    tenantMeta?: Record<string, unknown>,
  ): TransformerContext {
    const baseMeta: Record<string, unknown> = { ...(partial?.metadata ?? {}) };
    if (tenantMeta) {
      // tenant fields take precedence over caller-supplied metadata
      Object.assign(baseMeta, tenantMeta);
    }
    return {
      executionId: partial?.executionId ?? Date.now().toString(),
      timestamp:   partial?.timestamp   ?? Date.now(),
      metadata:    baseMeta,
    };
  }

  // ── ITransformerEngine (L1/L2 backward-compat) ───────────────────────────

  /** Synchronously register a transformer – does NOT invoke lifecycle hooks. */
  registerTransformer(transformer: ITransformer): void {
    this.transformers.set(transformer.name, transformer);
    // Only set state if not already managed via loadTransformer
    if (!this.registry.has(transformer.name)) {
      this.registry.set(transformer.name, {
        transformerName: transformer.name,
        version: transformer.version,
        state: 'loaded',
        loadedAt: Date.now(),
      });
    }
  }

  getTransformer(name: string): ITransformer | undefined {
    return this.transformers.get(name);
  }

  async execute<TInput, TOutput>(
    transformerName: string,
    input: TInput,
    context?: Partial<TransformerContext>,
  ): Promise<TOutput> {
    const transformer = this.transformers.get(transformerName);
    if (!transformer) {
      throw new Error(`Transformer ${transformerName} not found`);
    }
    const ctx = this.buildContext(context);
    
    if (!ctx.metadata || !ctx.metadata.tenantId) {
      throw new Error('TenantContext is mandatory');
    }

    return transformer.transform(input, ctx) as Promise<TOutput>;
  }

  // ── ITransformerEngineL3 – Lifecycle ─────────────────────────────────────

  async loadTransformer(transformer: ITransformer): Promise<void> {
    if (this.registry.has(transformer.name)) {
      const existing = this.registry.get(transformer.name)!;
      if (existing.state === 'loaded' || existing.state === 'loading') {
        throw new Error(
          `Transformer "${transformer.name}" is already loaded. Unload it first.`,
        );
      }
    }

    // Mark as loading
    const entry: TransformerRegistryEntry = {
      transformerName: transformer.name,
      version: transformer.version,
      state: 'loading',
    };
    this.registry.set(transformer.name, entry);

    try {
      if (hasLifecycle(transformer) && typeof transformer.onLoad === 'function') {
        await transformer.onLoad();
      }

      // Promote to loaded
      entry.state = 'loaded';
      entry.loadedAt = Date.now();
      this.transformers.set(transformer.name, transformer);
    } catch (err) {
      entry.state = 'error';
      entry.error = err instanceof Error ? err : new Error(String(err));
      throw err;
    }
  }

  async unloadTransformer(transformerName: string): Promise<void> {
    if (!this.registry.has(transformerName)) {
      // No-op for unknown names
      return;
    }

    const entry = this.registry.get(transformerName)!;
    if (entry.state !== 'loaded') {
      // Can only unload a loaded transformer
      return;
    }

    entry.state = 'unloading';

    const transformer = this.transformers.get(transformerName);
    if (transformer && hasLifecycle(transformer) && typeof transformer.onUnload === 'function') {
      await transformer.onUnload();
    }

    entry.state = 'unloaded';
    this.transformers.delete(transformerName);
  }

  getTransformerState(transformerName: string): TransformerState {
    return this.registry.get(transformerName)?.state ?? 'unloaded';
  }

  listTransformers(): string[] {
    return Array.from(this.registry.entries())
      .filter(([, entry]) => entry.state === 'loaded')
      .map(([name]) => name);
  }

  // ── ITransformerEngineL3 – Pipeline ───────────────────────────────────────

  registerPipeline(pipeline: TransformerPipeline): void {
    this.pipelines.set(pipeline.name, pipeline);
  }

  async executePipeline<TInput, TFinal>(
    pipelineName: string,
    input: TInput,
    context?: Partial<TransformerContext>,
    tenantMeta?: Record<string, unknown>,
  ): Promise<PipelineResult<TFinal>> {
    const pipeline = this.pipelines.get(pipelineName);
    if (!pipeline) {
      throw new Error(`Pipeline "${pipelineName}" not found`);
    }

    const ctx = this.buildContext(context, tenantMeta);
    
    if (!ctx.metadata || !ctx.metadata.tenantId) {
      throw new Error('TenantContext is mandatory');
    }

    const pipelineStart = Date.now();
    const stepResults: PipelineStepResult[] = [];

    let current: unknown = input;

    for (let i = 0; i < pipeline.steps.length; i++) {
      const step = pipeline.steps[i];
      const transformer = this.transformers.get(step.transformerName);
      if (!transformer) {
        throw new Error(`Transformer "${step.transformerName}" not found`);
      }

      // Merge step-level metadata into the shared context metadata
      const stepCtx: TransformerContext = {
        ...ctx,
        metadata: {
          ...ctx.metadata,
          ...(step.stepMetadata ?? {}),
        },
      };

      const stepStart = Date.now();
      current = await transformer.transform(current, stepCtx);
      const durationMs = Date.now() - stepStart;

      stepResults.push({
        step: i,
        transformerName: step.transformerName,
        output: current,
        durationMs,
      });
    }

    return {
      pipelineName,
      stepResults,
      finalOutput: current as TFinal,
      totalDurationMs: Date.now() - pipelineStart,
      context: ctx,
    };
  }

  // ── ITransformerEngineL3 – Tenant Isolation ───────────────────────────────

  async executeForTenant<TInput, TOutput>(
    transformerName: string,
    input: TInput,
    tenant: TenantContext,
    context?: Partial<TransformerContext>,
  ): Promise<TOutput> {
    const tenantMeta: Record<string, unknown> = {
      tenantId: tenant.tenantId,
      plan: tenant.plan,
      ...(tenant.metadata ?? {}),
    };

    const ctx = this.buildContext(context, tenantMeta);
    return this.execute<TInput, TOutput>(transformerName, input, ctx);
  }

  async executePipelineForTenant<TInput, TFinal>(
    pipelineName: string,
    input: TInput,
    tenant: TenantContext,
    context?: Partial<TransformerContext>,
  ): Promise<PipelineResult<TFinal>> {
    const tenantMeta: Record<string, unknown> = {
      tenantId: tenant.tenantId,
      plan: tenant.plan,
      ...(tenant.metadata ?? {}),
    };

    return this.executePipeline<TInput, TFinal>(pipelineName, input, context, tenantMeta);
  }
}
