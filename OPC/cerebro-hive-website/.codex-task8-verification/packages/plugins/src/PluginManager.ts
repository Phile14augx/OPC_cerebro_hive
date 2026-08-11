
import { PluginManifest } from './PluginManifest';
import { CapabilityRegistry } from './CapabilityRegistry';

class PluginManagerImpl {
  private plugins = new Map<string, PluginManifest>();

  async register(plugin: PluginManifest) {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered.`);
      return false;
    }

    if (!CapabilityRegistry.validateRequirements(plugin.capabilities.requires)) {
      console.error(`Plugin ${plugin.id} failed dependency check. Missing capabilities.`);
      return false;
    }

    // Install
    await plugin.lifecycle.install();

    // Register provided capabilities
    plugin.capabilities.provides.forEach(cap => CapabilityRegistry.register(cap));

    // Activate
    await plugin.lifecycle.activate();

    this.plugins.set(plugin.id, plugin);
    console.log(`[PluginManager] Successfully registered and activated plugin: ${plugin.id}`);
    return true;
  }

  getPlugins() {
    return Array.from(this.plugins.values());
  }
}

export const PluginManager = new PluginManagerImpl();
