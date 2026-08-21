/**
 * M24 — ExecutionKernel
 *
 * The central orchestration hub. SimulatorRuntime is now a thin API shell
 * that delegates everything to the kernel. This separation means:
 *
 *   - The kernel can be tested standalone (no UI wiring needed).
 *   - Future runtimes (StreamingRuntime, DistributedRuntime) reuse the kernel.
 *   - Every future capability plugs into plugins or executors — kernel never changes.
 *
 *  kernel/
 *    ├── Scheduler          → what to run next
 *    ├── RuntimeCapabilityRegistry → how to run each node type
 *    ├── PluginPipeline     → cross-cutting concerns (metrics, trace, cache, debug)
 *    ├── InputResolver      → data routing in
 *    ├── OutputRouter       → data routing out
 *    ├── EventDispatcher    → event bus
 *    ├── SnapshotManager    → checkpointing
 *    └── RuntimeStateMachine→ validated state transitions
 */
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult, errResult } from '../execution/ExecutionResult';
import { ExecutionError } from '../execution/ExecutionError';
import { ExecutionPortStore, TypedValue } from '../routing/ExecutionPortStore';
import { InputResolver } from '../routing/InputResolver';
import { OutputRouter } from '../routing/OutputRouter';
import { RuntimeCapabilityRegistry } from './RuntimeCapabilityRegistry';
import { RuntimeStateMachine } from './RuntimeStateMachine';
import { ExecutionCursor } from './ExecutionCursor';
import { Scheduler } from './Scheduler';
import { PluginPipeline } from '../plugins/RuntimePlugin';
import { EventDispatcher } from '../observability/EventDispatcher';
import { SnapshotManager } from '../replay/SnapshotManager';
import { RecordingBuilder } from '../replay/Recording';
import { startExecutionTrace, startStageSpan, startNodeSpan, Span } from '../observability/OpenTelemetry';
import { resolvePolicy } from '../execution/ExecutionPolicy';
import { ExecutionEventType } from '../ExecutionEvents';
import { Types } from '../../compiler/types/TypeSystem';

export interface KernelRunOptions {
  stepMode?: boolean; // run only one node then pause
}

export class ExecutionKernel {
  private context: ExecutionContext;
  private registry: RuntimeCapabilityRegistry;
  private plugins: PluginPipeline;
  private portStore: ExecutionPortStore;
  private cursor: ExecutionCursor;
  private stateMachine: RuntimeStateMachine;
  private dispatcher: EventDispatcher;
  private snapshots: SnapshotManager;
  private recording: RecordingBuilder;
  private breakpoints: Set<string> = new Set();

  // OTel spans
  private executionSpan?: Span;
  private stageSpans: Map<string, Span> = new Map();

  constructor(
    context: ExecutionContext,
    registry: RuntimeCapabilityRegistry,
    plugins: PluginPipeline,
    dispatcher: EventDispatcher,
  ) {
    this.context = context;
    this.registry = registry;
    this.plugins = plugins;
    this.dispatcher = dispatcher;
    this.portStore = new ExecutionPortStore();
    this.cursor = new ExecutionCursor(context.executionPlan);
    this.stateMachine = new RuntimeStateMachine();
    this.snapshots = new SnapshotManager();
    this.recording = new RecordingBuilder();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  get state() { return this.stateMachine.state; }
  get cursor_() { return this.cursor; }
  get portStore_() { return this.portStore; }
  get snapshotManager() { return this.snapshots; }
  get eventDispatcher() { return this.dispatcher; }
  get stateMachine_() { return this.stateMachine; }

  addBreakpoint(nodeId: string): void { this.breakpoints.add(nodeId); }
  removeBreakpoint(nodeId: string): void { this.breakpoints.delete(nodeId); }

  async start(opts: KernelRunOptions = {}): Promise<void> {
    if (this.stateMachine.is('IDLE', 'READY')) {
      if (this.stateMachine.is('IDLE')) this.stateMachine.transitionTo('READY');
      this.stateMachine.transitionTo('RUNNING');
    } else if (!this.stateMachine.is('PAUSED')) {
      return;
    } else {
      this.stateMachine.transitionTo('RUNNING');
    }

    this.executionSpan = startExecutionTrace(this.context.executionId);
    this.emit('ExecutionStarted', { executionId: this.context.executionId });
    await this.plugins.runBeforeExecution(this.context);

    let prevStageId: string | undefined;

    while (Scheduler.hasMore(this.cursor) && this.stateMachine.is('RUNNING')) {
      const exhausted = this.context.resources.isExhausted();
      if (exhausted.exhausted) {
        this.emit('ErrorRaised', { reason: exhausted.reason });
        this.stateMachine.transitionTo('ERROR');
        break;
      }
      if (this.context.isCancelled) {
        this.stateMachine.transitionTo('CANCELLED');
        break;
      }

      const stage = this.cursor.currentStage!;
      const nodeId = this.cursor.currentNodeId!;

      // Stage lifecycle
      if (stage.id !== prevStageId) {
        if (prevStageId) {
          this.stageSpans.get(prevStageId)?.end();
          this.emit('StageCompleted', {}, prevStageId);
        }
        const stageSpan = startStageSpan(stage.id, this.executionSpan!);
        this.stageSpans.set(stage.id, stageSpan);
        this.emit('StageStarted', {}, stage.id);
        prevStageId = stage.id;
      }

      await this.executeNode(nodeId, stage.id);

      if (opts.stepMode) {
        this.cursor.advance();
        this.stateMachine.transitionTo(this.cursor.isFinished ? 'FINISHED' : 'PAUSED');
        this.emit(this.cursor.isFinished ? 'ExecutionFinished' : 'ExecutionPaused', { reason: 'step' });
        return;
      }

      if (!this.stateMachine.is('RUNNING')) break;
      this.cursor.advance();
      this.snapshots.maybeCheckpoint(this.recording['events'].length, this.portStore, this.cursor,
        prevStageId ? [prevStageId] : []);
    }

    if (this.stateMachine.is('RUNNING')) {
      if (prevStageId) { this.stageSpans.get(prevStageId)?.end(); this.emit('StageCompleted', {}, prevStageId); }
      this.stateMachine.transitionTo('FINISHED');
      this.emit('ExecutionFinished', { metrics: this.context.metrics.snapshot() });
    } else if (this.stateMachine.is('CANCELLED')) {
      this.emit('ExecutionCancelled', {});
    }

    this.executionSpan?.end({ status: this.stateMachine.state });
    await this.plugins.runAfterExecution(this.context);
  }

  async step(): Promise<void> {
    if (this.stateMachine.is('IDLE')) { this.stateMachine.transitionTo('READY'); }
    this.stateMachine.transitionTo(this.stateMachine.is('PAUSED') ? 'RUNNING' : 'RUNNING');
    await this.start({ stepMode: true });
  }

  pause(): void {
    if (!this.stateMachine.is('RUNNING')) return;
    this.stateMachine.transitionTo('PAUSED');
    this.emit('ExecutionPaused', { reason: 'user' });
  }

  cancel(): void {
    this.context.cancel();
    if (!this.stateMachine.isTerminal()) this.stateMachine.transitionTo('CANCELLED');
    this.emit('ExecutionCancelled', {});
  }

  reset(): void {
    this.cursor.reset();
    this.portStore.clear();
    this.stateMachine.transitionTo('IDLE');
    this.dispatcher.clear();
    this.recording = new RecordingBuilder();
  }

  getRecording() {
    const m = this.context.metrics;
    const snaps = this.snapshots.getAll();
    const rec = this.recording.build({
      executionId: this.context.executionId,
      executionPlanId: this.context.executionPlan.metadata?.version ?? 'unknown',
      simulationMode: this.context.simulationMode,
      totalTokens: m.totalTokens,
      totalCostUsd: m.totalCostUsd,
      nodeCount: this.context.graph.nodes.length,
    });
    return { ...rec, snapshots: snaps };
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async executeNode(nodeId: string, stageId: string): Promise<void> {
    const node = this.context.graph.nodes.find(n => n.id === nodeId);
    if (!node) {
      this.emit('NodeSkipped', { reason: 'Node not in graph' }, stageId, nodeId);
      return;
    }

    if (this.breakpoints.has(nodeId)) {
      this.stateMachine.transitionTo('PAUSED');
      this.emit('BreakpointHit', { nodeId }, stageId, nodeId);
      return;
    }

    const policy = resolvePolicy(node.configuration?.['executionPolicy']);
    this.emit('NodeQueued', {}, stageId, nodeId);

    const inputs = InputResolver.resolve(node, stageId, this.context, this.portStore);
    this.emit('NodeInputResolved', { inputs }, stageId, nodeId);

    // Check cache hit from CachePlugin
    if (this.context.get<boolean>('cache.hit')) {
      const cached = this.context.get<ExecutionResult>('cache.result')!;
      this.emit('NodeCompleted', { output: { type: cached.type, value: cached.value, timestamp: Date.now() }, cached: true }, stageId, nodeId);
      return;
    }

    await this.plugins.runBeforeNode(node, inputs, this.context);

    const executor = this.registry.resolve(node);
    if (!executor) {
      const err = new ExecutionError({ category: 'NodeExecutionError', message: `No executor for type "${node.type}"`, nodeId, executionId: this.context.executionId, stageId });
      this.emit('ErrorRaised', err.toJSON(), stageId, nodeId);
      this.stateMachine.transitionTo('ERROR');
      return;
    }

    this.emit('NodeStarted', { nodeType: node.type }, stageId, nodeId);
    const nodeSpan = startNodeSpan(nodeId, node.type, this.stageSpans.get(stageId) ?? this.executionSpan!);

    let result: ExecutionResult;
    const deadline = Date.now() + policy.timeoutMs;
    let attempt = 0;

    while (true) {
      attempt++;
      try {
        result = await Promise.race([
          executor.execute(node, this.context, inputs),
          new Promise<ExecutionResult>((_, rej) =>
            setTimeout(() => rej(new ExecutionError({ category: 'TimeoutError', message: `Node "${nodeId}" timed out after ${policy.timeoutMs}ms`, nodeId, retryable: false })),
              deadline - Date.now())),
        ]);
        break;
      } catch (err) {
        const execErr = err instanceof ExecutionError ? err :
          new ExecutionError({ category: 'NodeExecutionError', message: String(err), nodeId, executionId: this.context.executionId, retryable: true });

        if (execErr.retryable && attempt < policy.retry.maxAttempts) {
          this.emit('NodeRetrying', { attempt, reason: execErr.message }, stageId, nodeId);
          await new Promise(r => setTimeout(r, policy.retry.backoffMs * Math.pow(policy.retry.backoffMultiplier, attempt - 1)));
          continue;
        }

        nodeSpan.setStatus('error', execErr.message);
        nodeSpan.end();
        this.emit('ErrorRaised', execErr.toJSON(), stageId, nodeId);
        if (policy.failureStrategy === 'Fail') { this.stateMachine.transitionTo('ERROR'); return; }
        result = errResult(Types.Unknown, execErr.message);
        break;
      }
    }

    nodeSpan.setAttribute('status', result!.status);
    nodeSpan.end();

    const typedOutput: TypedValue = { type: result!.type, value: result!.value, timestamp: Date.now() };
    OutputRouter.route(node, stageId, 'output', typedOutput, this.context, this.portStore);

    this.emit('NodeOutputProduced', { output: typedOutput }, stageId, nodeId);
    this.emit('NodeCompleted', { output: typedOutput, durationMs: result!.durationMs }, stageId, nodeId);

    await this.plugins.runAfterNode(node, result!, this.context);
  }

  private emit(type: ExecutionEventType, payload: unknown = {}, stageId?: string, nodeId?: string): void {
    this.dispatcher.dispatch(type, payload, stageId, nodeId);
    this.recording.addEvent({
      id: crypto.randomUUID(), timestamp: Date.now(), type, payload, stageId, nodeId,
    });
  }
}
