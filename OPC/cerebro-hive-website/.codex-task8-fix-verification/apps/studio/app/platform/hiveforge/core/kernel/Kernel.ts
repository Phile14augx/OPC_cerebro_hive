import { Plugin, PluginContext } from "../contracts/plugin";
import { eventBus } from "../events/EventBus";
import { platformRegistry } from "../registry/PlatformRegistry";

export class Kernel {
  private static instance: Kernel;
  
  private constructor() {}

  static getInstance(): Kernel {
    if (!Kernel.instance) {
      Kernel.instance = new Kernel();
    }
    return Kernel.instance;
  }

  createContext(pluginId: string, version: string): PluginContext {
    return {
      pluginId,
      version,
      getService: <T>(id: string): T | undefined => {
        // Return a service from the registry if needed
        return undefined; // placeholder
      },
      emitEvent: (eventName: string, payload: unknown) => {
        eventBus.publish({
          category: "ResourceLifecycle", // Can be inferred from context later
          type: eventName,
          source: pluginId,
          payload,
        });
      },
    };
  }

  private validateManifest(plugin: Plugin): boolean {
    const m = plugin.manifest;
    if (!m || !m.metadata || !m.metadata.id || !m.kind || !m.schemaVersion) {
      console.error(`[Kernel] Plugin ${m?.metadata?.id || 'unknown'} has invalid manifest schema.`);
      return false;
    }
    return true;
  }

  async loadPlugin(plugin: Plugin): Promise<void> {
    plugin.state = "installed";
    plugin.health = "Starting";
    const context = this.createContext(plugin.manifest.metadata.id, plugin.manifest.metadata.version);

    try {
      if (!this.validateManifest(plugin)) {
        throw new Error("Manifest validation failed structurally.");
      }

      if (plugin.validate) {
        const isValid = await plugin.validate(context);
        if (!isValid) throw new Error("Plugin validate() failed.");
      }
      
      plugin.state = "validated";

      if (plugin.resolveDependencies) {
        plugin.state = "resolving";
        const depsResolved = await plugin.resolveDependencies(context);
        if (!depsResolved) throw new Error("Plugin dependency resolution failed.");
      }
      
      // Register it in the registry (assuming extension kind as fallback or explicitly typed)
      if (plugin.register) {
         await plugin.register(context);
      }
      plugin.state = "registered";

      if (plugin.initialize) {
        await plugin.initialize(context);
      }
      plugin.state = "initialized";

      if (plugin.start) {
        await plugin.start(context);
      }
      plugin.state = "ready";
      plugin.health = "Healthy";

    } catch (err) {
      console.error(`[Kernel] Failed to load plugin ${plugin.manifest.metadata.id}`, err);
      plugin.state = "error";
      plugin.health = "Failed";
      throw err;
    }
  }

  async shutdown(): Promise<void> {
    for (const plugin of platformRegistry.getAll()) {
      if (plugin.stop) {
        const context = this.createContext(plugin.manifest.metadata.id, plugin.manifest.metadata.version);
        await plugin.stop(context);
      }
      if (plugin.unload) {
        const context = this.createContext(plugin.manifest.metadata.id, plugin.manifest.metadata.version);
        await plugin.unload(context);
      }
      plugin.state = "unloaded";
      plugin.health = "Disabled";
    }
  }
}

export const kernel = Kernel.getInstance();
