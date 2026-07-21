import { Plugin, PluginContext, ExtensionManifest, ActionDefinition, NavigationNode } from "../contracts/plugin";
import { eventBus } from "../events/EventBus";

export interface PlatformRegistryContext {
  get(id: string): Plugin | undefined;
  getAll(): Plugin[];
  getActions(): ActionDefinition[];
  getNavigationNodes(): NavigationNode[];
  exportSnapshot(): string;
  registerCloud(plugin: Plugin): Promise<void>;
  registerProvider(plugin: Plugin): Promise<void>;
  registerService(plugin: Plugin): Promise<void>;
  registerBlueprint(plugin: Plugin): Promise<void>;
  registerExtension(plugin: Plugin): Promise<void>;
}

export class Registry implements PlatformRegistryContext {
  private plugins: Map<string, Plugin> = new Map();
  private actions: Map<string, ActionDefinition> = new Map();
  private navigationNodes: Map<string, NavigationNode> = new Map();

  async registerCloud(plugin: Plugin): Promise<void> {
    await this.register(plugin, "cloud");
  }

  async registerProvider(plugin: Plugin): Promise<void> {
    await this.register(plugin, "provider");
  }

  async registerService(plugin: Plugin): Promise<void> {
    await this.register(plugin, "service");
  }

  async registerBlueprint(plugin: Plugin): Promise<void> {
    await this.register(plugin, "blueprint");
  }

  async registerExtension(plugin: Plugin): Promise<void> {
    await this.register(plugin, "extension");
  }

  private async register(plugin: Plugin, expectedKind: ExtensionManifest["kind"]): Promise<void> {
    if (plugin.manifest.kind !== expectedKind) {
      throw new Error(`[Registry] Invalid plugin kind. Expected ${expectedKind}, got ${plugin.manifest.kind}`);
    }

    const { id, name, version } = plugin.manifest.metadata;

    if (this.plugins.has(id)) {
      console.warn(`[Registry] Plugin ${id} is already registered. Overwriting.`);
    }

    this.plugins.set(id, plugin);

    // Register Actions
    if (plugin.actions) {
      plugin.actions.forEach(action => {
        this.actions.set(action.id, action);
      });
    }

    // Register Navigation Nodes
    if (plugin.navigationNodes) {
      plugin.navigationNodes.forEach(node => {
        this.navigationNodes.set(node.id, node);
      });
    }

    eventBus.publish({
      category: "ResourceLifecycle",
      type: "PluginRegistered",
      source: "PlatformRegistry",
      payload: { id, name, version, kind: expectedKind },
    });
  }

  get(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getActions(): ActionDefinition[] {
    return Array.from(this.actions.values());
  }

  getNavigationNodes(): NavigationNode[] {
    return Array.from(this.navigationNodes.values());
  }

  exportSnapshot(): string {
    return JSON.stringify({
      plugins: Array.from(this.plugins.keys()),
      actions: Array.from(this.actions.keys()),
      navigationNodes: Array.from(this.navigationNodes.keys()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}

export const platformRegistry = new Registry();
