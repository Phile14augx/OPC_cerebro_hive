/**
 * Metadata for a CerebroHive Plugin.
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
}

/**
 * CerebroPlugin defines the lifecycle interface for all platform extensions.
 * A plugin can register execution providers, tools, memory stores, or external API connectors.
 */
export interface CerebroPlugin {
  readonly metadata: PluginMetadata;

  /**
   * Called when the plugin is loaded into the runtime.
   * This is where the plugin should register its capabilities.
   * @param runtime The central Cerebro Runtime orchestrator.
   */
  onLoad(runtime: any): Promise<void>;

  /**
   * Called before the plugin is unloaded or the system shuts down.
   */
  onUnload(runtime: any): Promise<void>;
}

