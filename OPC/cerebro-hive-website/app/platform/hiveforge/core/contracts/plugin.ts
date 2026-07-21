/**
 * Core Plugin Contracts
 * 
 * Defines the standard lifecycle and structure for all extensions, providers, and modules
 * in the HiveForge microkernel architecture.
 */

export type PluginLifecycleState =
  | "installed"
  | "validated"
  | "resolving"
  | "registered"
  | "initialized"
  | "starting"
  | "ready"
  | "stopping"
  | "unloaded"
  | "error";

export type PluginHealthState = 
  | "Starting"
  | "Healthy"
  | "Degraded"
  | "Stopping"
  | "Failed"
  | "Disabled";

export interface PluginContext {
  pluginId: string;
  version: string;
  // Injected dependencies from the Kernel will go here
  getService<T>(id: string): T | undefined;
  emitEvent(eventName: string, payload: unknown): void;
}

export interface ExtensionDependency {
  id: string;
  version: string; // semver
  optional?: boolean;
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
  dependencies?: ExtensionDependency[];
  permissions?: {
    required: string[];
    optional?: string[];
  };
  spec: Record<string, unknown>;
}

export interface NavigationNode {
  id: string;
  location: "workspace" | "clouds" | "marketplace" | "administration" | "favorites" | "pinned" | "templates";
  title: string;
  icon?: string;
  priority: number;
  path?: string;
  actionId?: string;
  children?: NavigationNode[];
}

export interface ActionDefinition {
  id: string;
  title: string;
  category: "Search" | "Deploy" | "Provision" | "Generate" | "Navigate" | "Debug" | "Monitor" | "Create" | "Manage" | "Open" | "Explain" | "AI" | "General";
  icon?: string;
  execute: (context: unknown) => Promise<void>;
  keyboardShortcut?: string;
}

import { IProvisioningProvider } from "./provider";

export interface Plugin {
  readonly manifest: ExtensionManifest;
  state: PluginLifecycleState;
  health: PluginHealthState;
  
  // Executable capabilities
  provider?: IProvisioningProvider;

  // Contributions
  navigationNodes?: NavigationNode[];
  actions?: ActionDefinition[];

  // Lifecycle Hooks
  validate?(context: PluginContext): Promise<boolean>;
  resolveDependencies?(context: PluginContext): Promise<boolean>;
  register(context: PluginContext): Promise<void>;
  initialize?(context: PluginContext): Promise<void>;
  start?(context: PluginContext): Promise<void>;
  stop?(context: PluginContext): Promise<void>;
  unload?(context: PluginContext): Promise<void>;
}

