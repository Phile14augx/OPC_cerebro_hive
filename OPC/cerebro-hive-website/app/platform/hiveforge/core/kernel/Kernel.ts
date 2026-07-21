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

  async loadPlugin(plugin: Plugin): Promise<void> {
    const context = this.createContext(plugin.manifest.metadata.id, plugin.manifest.metadata.version);

    try {
      if (plugin.validate) {
        const isValid = await plugin.validate(context);
        if (!isValid) throw new Error("Plugin validation failed.");
      }
      
      // Register it in the registry (assuming extension kind as fallback or explicitly typed)
      if (plugin.register) {
         await plugin.register(context);
      }

      if (plugin.initialize) {
        await plugin.initialize(context);
      }

      if (plugin.start) {
        await plugin.start(context);
      }

    } catch (err) {
      console.error(`[Kernel] Failed to load plugin ${plugin.manifest.metadata.id}`, err);
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
    }
  }
}

export const kernel = Kernel.getInstance();
