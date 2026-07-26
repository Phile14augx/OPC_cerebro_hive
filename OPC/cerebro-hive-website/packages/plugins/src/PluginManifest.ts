
export interface PluginManifest {
  id: string;
  version: string;
  metadata: {
    name: string;
    description: string;
    author: string;
  };
  capabilities: {
    provides: string[];
    requires: string[];
  };
  lifecycle: {
    install: () => Promise<void> | void;
    activate: () => Promise<void> | void;
    deactivate: () => Promise<void> | void;
    dispose: () => Promise<void> | void;
  };
}
