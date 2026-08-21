/**
 * M24 — SimulatorRuntime
 *
 * Now a thin public API shell over ExecutionKernel.
 * All orchestration logic lives in the kernel; this class only:
 *   1. Constructs and wires the kernel with default plugins + executors
 *   2. Exposes the clean public API surface for UI / zustand slice
 *   3. Forwards subscriptions to the EventDispatcher
 *
 * Future runtimes (Streaming, Distributed, Replay) reuse the same kernel.
 */
import { ExecutionContext } from './execution/ExecutionContext';
import { ExecutionKernel } from './kernel/ExecutionKernel';
import { RuntimeCapabilityRegistry } from './kernel/RuntimeCapabilityRegistry';
import { PluginPipeline } from './plugins/RuntimePlugin';
import { MetricsPlugin } from './plugins/MetricsPlugin';
import { TracePlugin } from './plugins/TracePlugin';
import { LoggerPlugin } from './plugins/LoggerPlugin';
import { DebugPlugin } from './plugins/DebugPlugin';
import { CachePlugin } from './plugins/CachePlugin';
import { LlmExecutor } from './executors/LlmExecutor';
import { MemoryExecutor } from './executors/MemoryExecutor';
import { ToolExecutor } from './executors/ToolExecutor';
import { FallbackExecutor } from './executors/FallbackExecutor';
import { EventDispatcher, DispatchedEvent } from './observability/EventDispatcher';
import { ExecutionEventType } from './ExecutionEvents';
import { ExecutionRecording } from './replay/Recording';

export class SimulatorRuntime {
  private kernel: ExecutionKernel;
  private debugPlugin: DebugPlugin;

  constructor(context: ExecutionContext) {
    // ── Build plugin pipeline ──────────────────────────────────────────────
    const plugins = new PluginPipeline();
    plugins.install(new LoggerPlugin());
    plugins.install(new MetricsPlugin());
    plugins.install(new TracePlugin());
    const debugPlugin = new DebugPlugin();
    plugins.install(debugPlugin);
    plugins.install(new CachePlugin());
    this.debugPlugin = debugPlugin;

    // ── Build capability registry ──────────────────────────────────────────
    const registry = new RuntimeCapabilityRegistry();
    registry.register(new LlmExecutor());
    registry.register(new MemoryExecutor());
    registry.register(new ToolExecutor());
    registry.register(new FallbackExecutor()); // must be last

    // ── Build event dispatcher ─────────────────────────────────────────────
    const dispatcher = new EventDispatcher();

    // ── Build kernel ───────────────────────────────────────────────────────
    this.kernel = new ExecutionKernel(context, registry, plugins, dispatcher);

    // Wire debug plugin pause signal → kernel
    debugPlugin.onPause(() => this.kernel.pause());
  }

  // ── Event subscriptions ───────────────────────────────────────────────────

  /** Subscribe to all events (returns unsubscribe function). */
  subscribe(listener: (event: DispatchedEvent) => void): () => void {
    return this.kernel.eventDispatcher.onAny(listener);
  }

  /** Subscribe to a specific event type. */
  on(type: ExecutionEventType, listener: (event: DispatchedEvent) => void): () => void {
    return this.kernel.eventDispatcher.on(type, listener);
  }

  // ── Execution control ─────────────────────────────────────────────────────

  async run(): Promise<void> { return this.kernel.start(); }
  async step(): Promise<void> { return this.kernel.step(); }
  pause(reason = 'User Paused'): void { void reason; this.kernel.pause(); }
  resume(): void { this.kernel.start(); }
  cancel(): void { this.kernel.cancel(); }
  stop(): void { this.kernel.reset(); }

  // ── Debugger controls ─────────────────────────────────────────────────────

  addBreakpoint(nodeId: string): void { this.kernel.addBreakpoint(nodeId); this.debugPlugin.addBreakpoint(nodeId); }
  removeBreakpoint(nodeId: string): void { this.kernel.removeBreakpoint(nodeId); this.debugPlugin.removeBreakpoint(nodeId); }

  // ── State & recording ─────────────────────────────────────────────────────

  get state() { return this.kernel.state; }
  getRecording(): ExecutionRecording { return this.kernel.getRecording(); }
  getEventLog(): DispatchedEvent[] { return this.kernel.eventDispatcher.getLog(); }
}
