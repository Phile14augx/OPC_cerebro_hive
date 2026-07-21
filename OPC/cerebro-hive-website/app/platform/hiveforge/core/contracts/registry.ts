import { Plugin, ExtensionManifest } from "./plugin";

export interface RegistryContext {
  getPlugin(id: string): Plugin | undefined;
  getManifest(id: string): ExtensionManifest | undefined;
  listPluginsByKind(kind: string): Plugin[];
}

export interface PlatformRegistry {
  registerCloud(plugin: Plugin): Promise<void>;
  registerProvider(plugin: Plugin): Promise<void>;
  registerService(plugin: Plugin): Promise<void>;
  registerBlueprint(plugin: Plugin): Promise<void>;
  registerExtension(plugin: Plugin): Promise<void>;
  
  get(id: string): Plugin | undefined;
  getAll(): Plugin[];
  
  // Dependency resolution and metadata retrieval
  resolveDependencies(plugin: Plugin): boolean;
}
