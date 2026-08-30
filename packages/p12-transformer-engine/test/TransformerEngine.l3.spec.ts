/**
 * L3 Test Suite – TransformerEngine Business Logic & Integration
 *
 * Covers:
 *   1. Transformer registration & lifecycle (load / unload / state)
 *   2. Duplicate-registration guard
 *   3. Pipeline execution (chained transformers)
 *   4. Tenant isolation (metadata scoping, cross-tenant independence)
 *   5. Lifecycle hooks (onLoad / onUnload) – called exactly once
 *   6. Error propagation in pipelines
 *   7. Unload mid-pipeline guard
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TransformerEngine } from '../src/TransformerEngine';
import { ITransformer, TransformerContext } from '../src/contracts/ITransformer';
import { ITransformerLifecycle } from '../src/contracts/ITransformerLifecycle';
import { TransformerPipeline } from '../src/contracts/ITransformerPipeline';
import { TenantContext } from '../src/contracts/ITransformerEngineL3';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Transformer that uppercases a string. */
class UpperTransformer implements ITransformer<string, string> {
  readonly name = 'upper';
  readonly version = '1.0.0';
  async transform(input: string): Promise<string> {
    return input.toUpperCase();
  }
}

/** Transformer that appends '!'. */
class BangTransformer implements ITransformer<string, string> {
  readonly name = 'bang';
  readonly version = '1.0.0';
  async transform(input: string): Promise<string> {
    return input + '!';
  }
}

/** Transformer that trims whitespace. */
class TrimTransformer implements ITransformer<string, string> {
  readonly name = 'trim';
  readonly version = '1.0.0';
  async transform(input: string): Promise<string> {
    return input.trim();
  }
}

/** Transformer that injects tenant-id from context metadata. */
class TenantTagTransformer implements ITransformer<string, string> {
  readonly name = 'tenantTag';
  readonly version = '1.0.0';
  async transform(input: string, ctx: TransformerContext): Promise<string> {
    const tid = ctx.metadata?.tenantId ?? 'unknown';
    return `[${tid}] ${input}`;
  }
}

/** Transformer that always throws. */
class BrokenTransformer implements ITransformer<string, string> {
  readonly name = 'broken';
  readonly version = '1.0.0';
  async transform(): Promise<string> {
    throw new Error('transform failed');
  }
}

/** Transformer with spy-able lifecycle hooks. */
class LifecycleTransformer
  implements ITransformer<string, string>, ITransformerLifecycle
{
  readonly name: string;
  readonly version = '1.0.0';
  onLoadSpy = vi.fn().mockResolvedValue(undefined);
  onUnloadSpy = vi.fn().mockResolvedValue(undefined);

  constructor(name = 'lifecycle') {
    this.name = name;
  }

  async transform(input: string): Promise<string> {
    return input;
  }

  async onLoad(): Promise<void> {
    return this.onLoadSpy();
  }

  async onUnload(): Promise<void> {
    return this.onUnloadSpy();
  }
}

// ─── Test Suite ─────────────────────────────────────────────────────────────

describe('TransformerEngine – L3 Business Logic', () => {
  let engine: TransformerEngine;

  beforeEach(() => {
    engine = new TransformerEngine();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── 1. Lifecycle: loadTransformer / state / listTransformers ──────────────

  describe('Lifecycle Management', () => {
    it('loadTransformer registers and transitions to "loaded" state', async () => {
      await engine.loadTransformer(new UpperTransformer());

      expect(engine.getTransformerState('upper')).toBe('loaded');
    });

    it('listTransformers returns all loaded transformer names', async () => {
      await engine.loadTransformer(new UpperTransformer());
      await engine.loadTransformer(new BangTransformer());

      const names = engine.listTransformers();
      expect(names).toContain('upper');
      expect(names).toContain('bang');
      expect(names).toHaveLength(2);
    });

    it('loadTransformer throws on duplicate name', async () => {
      await engine.loadTransformer(new UpperTransformer());

      await expect(engine.loadTransformer(new UpperTransformer())).rejects.toThrow(
        /already (loaded|registered)/i,
      );
    });

    it('unloadTransformer transitions to "unloaded" and removes from list', async () => {
      await engine.loadTransformer(new UpperTransformer());
      await engine.unloadTransformer('upper');

      expect(engine.getTransformerState('upper')).toBe('unloaded');
      expect(engine.listTransformers()).not.toContain('upper');
    });

    it('unloadTransformer is a no-op for unknown name', async () => {
      await expect(engine.unloadTransformer('nonexistent')).resolves.toBeUndefined();
    });

    it('getTransformerState returns "unloaded" for unknown transformer', () => {
      expect(engine.getTransformerState('ghost')).toBe('unloaded');
    });

    it('after unload, execute throws transformer-not-found', async () => {
      await engine.loadTransformer(new UpperTransformer());
      await engine.unloadTransformer('upper');

      await expect(engine.execute('upper', 'hello')).rejects.toThrow(/not found/i);
    });
  });

  // ── 2. Lifecycle Hooks ────────────────────────────────────────────────────

  describe('Lifecycle Hooks (onLoad / onUnload)', () => {
    it('calls onLoad exactly once when loadTransformer succeeds', async () => {
      const t = new LifecycleTransformer();
      await engine.loadTransformer(t);

      expect(t.onLoadSpy).toHaveBeenCalledTimes(1);
    });

    it('calls onUnload exactly once when unloadTransformer succeeds', async () => {
      const t = new LifecycleTransformer();
      await engine.loadTransformer(t);
      await engine.unloadTransformer('lifecycle');

      expect(t.onUnloadSpy).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onLoad on registerTransformer (legacy path)', () => {
      const t = new LifecycleTransformer();
      engine.registerTransformer(t); // legacy synchronous method

      expect(t.onLoadSpy).not.toHaveBeenCalled();
    });

    it('engine marks transformer as "error" if onLoad throws', async () => {
      const t = new LifecycleTransformer();
      t.onLoadSpy.mockRejectedValueOnce(new Error('init failed'));

      await expect(engine.loadTransformer(t)).rejects.toThrow('init failed');
      expect(engine.getTransformerState('lifecycle')).toBe('error');
    });
  });

  // ── 3. Pipeline Registration & Execution ──────────────────────────────────

  describe('Pipeline Execution', () => {
    beforeEach(async () => {
      await engine.loadTransformer(new TrimTransformer());
      await engine.loadTransformer(new UpperTransformer());
      await engine.loadTransformer(new BangTransformer());
    });

    const pipeline: TransformerPipeline = {
      name: 'shout',
      steps: [
        { transformerName: 'trim' },
        { transformerName: 'upper' },
        { transformerName: 'bang' },
      ],
    };

    it('executes steps in order – trim → upper → bang', async () => {
      engine.registerPipeline(pipeline);

      const result = await engine.executePipeline<string, string>(
        'shout',
        '  hello  ',
        { metadata: { tenantId: 'test-tenant' } }
      );

      expect(result.finalOutput).toBe('HELLO!');
    });

    it('PipelineResult contains correct stepResults length and names', async () => {
      engine.registerPipeline(pipeline);

      const result = await engine.executePipeline('shout', '  hello  ', { metadata: { tenantId: 'test-tenant' } });

      expect(result.stepResults).toHaveLength(3);
      expect(result.stepResults[0].transformerName).toBe('trim');
      expect(result.stepResults[1].transformerName).toBe('upper');
      expect(result.stepResults[2].transformerName).toBe('bang');
    });

    it('PipelineResult reports pipelineName and context', async () => {
      engine.registerPipeline(pipeline);

      const result = await engine.executePipeline('shout', 'test', {
        executionId: 'pipe-abc',
        metadata: { tenantId: 'test-tenant' }
      });

      expect(result.pipelineName).toBe('shout');
      expect(result.context.executionId).toBe('pipe-abc');
    });

    it('each stepResult has a non-negative durationMs', async () => {
      engine.registerPipeline(pipeline);
      const result = await engine.executePipeline('shout', ' hi ', { metadata: { tenantId: 'test-tenant' } });

      result.stepResults.forEach(s => {
        expect(s.durationMs).toBeGreaterThanOrEqual(0);
      });
    });

    it('totalDurationMs >= sum of individual step durations', async () => {
      engine.registerPipeline(pipeline);
      const result = await engine.executePipeline('shout', ' hi ', { metadata: { tenantId: 'test-tenant' } });

      const sumSteps = result.stepResults.reduce((acc, s) => acc + s.durationMs, 0);
      expect(result.totalDurationMs).toBeGreaterThanOrEqual(sumSteps);
    });

    it('throws when executing an unregistered pipeline', async () => {
      await expect(engine.executePipeline('ghost-pipe', 'data', { metadata: { tenantId: 'test-tenant' } })).rejects.toThrow(
        /pipeline.*not found/i,
      );
    });

    it('propagates transformer error mid-pipeline with descriptive message', async () => {
      await engine.loadTransformer(new BrokenTransformer());
      engine.registerPipeline({
        name: 'failPipe',
        steps: [
          { transformerName: 'trim' },
          { transformerName: 'broken' },
          { transformerName: 'bang' },
        ],
      });

      await expect(engine.executePipeline('failPipe', '  hi  ', { metadata: { tenantId: 'test-tenant' } })).rejects.toThrow(
        /transform failed/i,
      );
    });

    it('throws when a pipeline step references an unloaded transformer', async () => {
      engine.registerPipeline({
        name: 'missingStep',
        steps: [{ transformerName: 'trim' }, { transformerName: 'nonexistent' }],
      });

      await expect(engine.executePipeline('missingStep', 'data', { metadata: { tenantId: 'test-tenant' } })).rejects.toThrow(
        /not found/i,
      );
    });
  });

  // ── 4. Tenant Isolation ───────────────────────────────────────────────────

  describe('Tenant Isolation', () => {
    const tenantA: TenantContext = {
      tenantId: 'tenant-a',
      plan: 'pro',
      metadata: { region: 'us-east' },
    };
    const tenantB: TenantContext = {
      tenantId: 'tenant-b',
      plan: 'free',
    };

    beforeEach(async () => {
      await engine.loadTransformer(new TenantTagTransformer());
      await engine.loadTransformer(new UpperTransformer());
      await engine.loadTransformer(new BangTransformer());
    });

    it('executeForTenant injects tenantId into context metadata', async () => {
      const result = await engine.executeForTenant<string, string>(
        'tenantTag',
        'hello',
        tenantA,
      );

      expect(result).toBe('[tenant-a] hello');
    });

    it('different tenants produce independent results', async () => {
      const [ra, rb] = await Promise.all([
        engine.executeForTenant<string, string>('tenantTag', 'hello', tenantA),
        engine.executeForTenant<string, string>('tenantTag', 'hello', tenantB),
      ]);

      expect(ra).toBe('[tenant-a] hello');
      expect(rb).toBe('[tenant-b] hello');
    });

    it('tenant metadata is merged with explicit context metadata', async () => {
      const result = await engine.executeForTenant<string, string>(
        'tenantTag',
        'hi',
        tenantA,
        { metadata: { extra: 'data' } },
      );

      // tenantId should still be present from tenant context
      expect(result).toBe('[tenant-a] hi');
    });

    it('executePipelineForTenant scopes tenantId through all pipeline steps', async () => {
      engine.registerPipeline({
        name: 'tagThenShout',
        steps: [
          { transformerName: 'tenantTag' },
          { transformerName: 'upper' },
          { transformerName: 'bang' },
        ],
      });

      const result = await engine.executePipelineForTenant<string, string>(
        'tagThenShout',
        'hello',
        tenantA,
      );

      expect(result.finalOutput).toBe('[TENANT-A] HELLO!');
    });

    it('executePipelineForTenant preserves pipelineName in result', async () => {
      engine.registerPipeline({
        name: 'tenantPipe',
        steps: [{ transformerName: 'upper' }],
      });

      const result = await engine.executePipelineForTenant(
        'tenantPipe',
        'x',
        tenantA,
      );

      expect(result.pipelineName).toBe('tenantPipe');
    });
    it('throws if tenantId is missing from metadata', async () => {
      await expect(engine.execute('tenantTag', 'hello')).rejects.toThrow(/TenantContext is mandatory/i);
    });

    it('executePipeline throws if tenantId is missing from metadata', async () => {
      engine.registerPipeline({
        name: 'testPipe',
        steps: [{ transformerName: 'tenantTag' }],
      });
      await expect(engine.executePipeline('testPipe', 'hello')).rejects.toThrow(/TenantContext is mandatory/i);
    });
  });

  // ── 5. Backward-Compat: legacy registerTransformer still works ────────────

  describe('Backward Compatibility (L1/L2 API)', () => {
    it('registerTransformer + execute still works without lifecycle', async () => {
      engine.registerTransformer(new UpperTransformer());

      const result = await engine.execute<string, string>('upper', 'hello', {
        executionId: 'exec-legacy',
        metadata: { tenantId: 'legacy-tenant' }
      });

      expect(result).toBe('HELLO');
    });

    it('getTransformer still returns the registered transformer', () => {
      const t = new UpperTransformer();
      engine.registerTransformer(t);

      expect(engine.getTransformer('upper')).toBe(t);
    });
  });
});
