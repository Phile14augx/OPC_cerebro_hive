const fs = require('fs');
const path = require('path');

const packagesDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages');

// ----------------------------------------------------
// EPIC 1: Plugin Runtime
// ----------------------------------------------------
const pluginsDir = path.join(packagesDir, 'plugins');
const pluginsSrc = path.join(pluginsDir, 'src');
fs.mkdirSync(pluginsSrc, { recursive: true });

fs.writeFileSync(path.join(pluginsDir, 'package.json'), JSON.stringify({
  name: "@cerebro/plugins",
  version: "0.1.0",
  private: true,
  main: "src/index.ts",
  dependencies: {
    "@cerebro/events": "workspace:*"
  }
}, null, 2));

// CapabilityRegistry
fs.writeFileSync(path.join(pluginsSrc, 'CapabilityRegistry.ts'), `
class CapabilityRegistryImpl {
  private capabilities = new Set<string>();

  register(capability: string) {
    this.capabilities.add(capability);
  }

  has(capability: string) {
    return this.capabilities.has(capability);
  }

  validateRequirements(requires: string[]): boolean {
    return requires.every(req => this.has(req));
  }
}

export const CapabilityRegistry = new CapabilityRegistryImpl();
`);

// PluginManifest
fs.writeFileSync(path.join(pluginsSrc, 'PluginManifest.ts'), `
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
`);

// PluginManager
fs.writeFileSync(path.join(pluginsSrc, 'PluginManager.ts'), `
import { PluginManifest } from './PluginManifest';
import { CapabilityRegistry } from './CapabilityRegistry';

class PluginManagerImpl {
  private plugins = new Map<string, PluginManifest>();

  async register(plugin: PluginManifest) {
    if (this.plugins.has(plugin.id)) {
      console.warn(\`Plugin \${plugin.id} is already registered.\`);
      return false;
    }

    if (!CapabilityRegistry.validateRequirements(plugin.capabilities.requires)) {
      console.error(\`Plugin \${plugin.id} failed dependency check. Missing capabilities.\`);
      return false;
    }

    // Install
    await plugin.lifecycle.install();

    // Register provided capabilities
    plugin.capabilities.provides.forEach(cap => CapabilityRegistry.register(cap));

    // Activate
    await plugin.lifecycle.activate();

    this.plugins.set(plugin.id, plugin);
    console.log(\`[PluginManager] Successfully registered and activated plugin: \${plugin.id}\`);
    return true;
  }

  getPlugins() {
    return Array.from(this.plugins.values());
  }
}

export const PluginManager = new PluginManagerImpl();
`);

fs.writeFileSync(path.join(pluginsSrc, 'index.ts'), `
export * from './CapabilityRegistry';
export * from './PluginManifest';
export * from './PluginManager';
`);


// ----------------------------------------------------
// EPIC 2: AppShell
// ----------------------------------------------------
const pulseDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'apps', 'pulse');
const pulseAppDir = path.join(pulseDir, 'app');
const sharedUiDir = path.join(pulseDir, 'shared', 'ui');

fs.writeFileSync(path.join(sharedUiDir, 'AppShell.tsx'), `
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60000 } }
});

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Parse current dashboard module for breadcrumbs
  const pathParts = pathname.split('/').filter(Boolean);
  const currentModule = pathParts[pathParts.length - 1] || 'Mission Control';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-screen bg-[var(--color-bg-primary)] overflow-hidden text-[var(--color-text-primary)] font-sans">
        
        {/* Global Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-surface-default)] flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-[var(--color-border-subtle)] font-bold tracking-tight">
            Cerebro Hive
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* These would eventually be dynamically generated from Plugin Manifests */}
            <a href="/dashboard/mission-control" className={\`block px-3 py-2 rounded-md text-sm font-medium \${pathname.includes('mission-control') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}\`}>Mission Control</a>
            <a href="/dashboard/telemetry" className={\`block px-3 py-2 rounded-md text-sm font-medium \${pathname.includes('telemetry') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}\`}>Telemetry</a>
            <a href="/dashboard/governance" className={\`block px-3 py-2 rounded-md text-sm font-medium \${pathname.includes('governance') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}\`}>Governance</a>
            <a href="/dashboard/observability" className={\`block px-3 py-2 rounded-md text-sm font-medium \${pathname.includes('observability') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}\`}>Observability</a>
            <a href="/dashboard/intelligence" className={\`block px-3 py-2 rounded-md text-sm font-medium \${pathname.includes('intelligence') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}\`}>Intelligence</a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Global Header / Breadcrumbs */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-default)]/50 backdrop-blur-sm z-10 flex-shrink-0">
            <div className="flex items-center text-sm font-medium text-[var(--color-text-muted)] space-x-2">
              <span>Platform</span>
              <span>/</span>
              <span className="text-[var(--color-text-primary)] capitalize">{currentModule.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                Cmd+K to Search
              </button>
            </div>
          </header>

          {/* Dashboard Canvas Wrapper */}
          <div className="flex-1 overflow-y-auto relative bg-[var(--color-bg-secondary)]">
            {children}
          </div>

        </main>
      </div>
    </QueryClientProvider>
  );
}
`);

// Replace ClientShell in layout.tsx with AppShell
let layoutContent = fs.readFileSync(path.join(pulseAppDir, 'layout.tsx'), 'utf8');
layoutContent = layoutContent.replace(/import { ClientShell } from '..\/shared\/ui\/ClientShell';/, "import { AppShell } from '../shared/ui/AppShell';");
layoutContent = layoutContent.replace(/<ClientShell>/g, "<AppShell>");
layoutContent = layoutContent.replace(/<\/ClientShell>/g, "</AppShell>");
fs.writeFileSync(path.join(pulseAppDir, 'layout.tsx'), layoutContent);

console.log('Epic 1 & 2 Scaffolded Successfully');
