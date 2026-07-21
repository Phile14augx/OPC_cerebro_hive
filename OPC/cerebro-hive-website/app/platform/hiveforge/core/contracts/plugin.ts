/**
 * Core Plugin Contracts
 * 
 * Defines the standard lifecycle and structure for all extensions, providers, and modules
 * in the HiveForge microkernel architecture.
 */

export type PluginLifecycleState =
  | "installed"
  | "validated"
  | "registered"
  | "initialized"
  | "starting"
  | "ready"
  | "stopping"
  | "unloaded"
  | "error";

export interface PluginContext {
  pluginId: string;
  version: string;
  // Injected dependencies from the Kernel will go here
  getService<T>(id: string): T | undefined;
  emitEvent(eventName: string, payload: unknown): void;
}

export interface ExtensionManifest {
  schemaVersion: "1.0";
  apiVersion: string;
  kind: "cloud" | "provider" | "service" | "blueprint" | "marketplace-item" | "extension";
  metadata: {
    id: string;
    name: string;
    version: string;
    description?: string;
    author?: string;
    icon?: string;
  };
  permissions?: {
    required: string[];
    optional?: string[];
  };
  spec: Record<string, unknown>;
}

export interface Plugin {
  readonly manifest: ExtensionManifest;
  readonly state: PluginLifecycleState;
  
  // Lifecycle Hooks
  validate?(context: PluginContext): Promise<boolean>;
  register(context: PluginContext): Promise<void>;
  initialize?(context: PluginContext): Promise<void>;
  start?(context: PluginContext): Promise<void>;
  stop?(context: PluginContext): Promise<void>;
  unload?(context: PluginContext): Promise<void>;
}
