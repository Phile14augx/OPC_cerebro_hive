import { RuntimeRegistry, CapabilityDescriptor } from '@cerebro/runtime-core';
import type { ToolProvider, ExecutionContext } from '@cerebro/runtime-core';
import { ToolRuntime, ToolRegistry } from '@cerebro/agent-builder-capability';

/**
 * Real ToolProvider backed by the existing ToolRuntime/ToolRegistry
 * (packages/capabilities/agent-builder/src/tools) — the only real tool
 * execution path in the repo, previously only reachable directly from
 * agent-builder. This converges runtime-core's ToolProvider capability
 * (previously unimplemented) with that existing code instead of building a
 * second implementation.
 *
 * Note: apps/studio has its own, separate Tool/invoke() system
 * (apps/studio/platform/src/domains/runtime/tools.ts — e.g. CalculatorTool,
 * CatalogTool) and apps/studio/agentos has a Python tool registry. Neither
 * is touched by this — they're distinct, unmigrated implementations, not
 * consolidated here.
 */
export class ToolRuntimeToolProvider implements ToolProvider {
  constructor(
    private readonly toolRuntime: ToolRuntime,
    private readonly toolRegistry: ToolRegistry
  ) {}

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}

  async invokeTool(toolName: string, args: Record<string, any>, context: ExecutionContext): Promise<any> {
    return this.toolRuntime.executeTool(toolName, args, context);
  }

  async listAvailableTools(_context: ExecutionContext): Promise<string[]> {
    return this.toolRegistry.listNames();
  }
}

/**
 * Registers the real ToolRuntime-backed provider into the shared
 * RuntimeRegistry. No mock ToolProvider exists to sit alongside — unlike
 * the LLM side, there's no external network dependency here that needs a
 * fallback story.
 */
export function registerToolRuntimeProvider(toolRuntime: ToolRuntime, toolRegistry: ToolRegistry): void {
  const registry = RuntimeRegistry.getInstance();

  const alreadyRegistered = registry
    .listCapabilities()
    .some((d) => d.metadata.capability === 'ToolProvider' && d.metadata.name === 'ToolRuntime-Tools');
  if (alreadyRegistered) return;

  const descriptor = new CapabilityDescriptor<ToolProvider>(
    {
      name: 'ToolRuntime-Tools',
      capability: 'ToolProvider',
      version: '1.0.0',
      priority: 10,
    },
    () => new ToolRuntimeToolProvider(toolRuntime, toolRegistry)
  );

  registry.register(descriptor);
  descriptor.setHealth('Healthy');
}
