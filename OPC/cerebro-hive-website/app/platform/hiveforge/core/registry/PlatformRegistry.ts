import { Plugin, PluginContext, ExtensionManifest } from "../contracts/plugin";
import { PlatformRegistry } from "../contracts/registry";
import { eventBus } from "../events/EventBus";

export class Registry implements PlatformRegistry {
  private plugins: Map<string, Plugin> = new Map();

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

  resolveDependencies(plugin: Plugin): boolean {
    // Basic dependency resolution check (to be expanded)
    return true;
  }
}

export const platformRegistry = new Registry();
