const fs = require('fs');
const path = require('path');

const expDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'experience', 'src');

const dirs = [
  'navigation',
  'shell',
  'commands',
  'overlays',
  'registry',
  'lifecycle'
];

dirs.forEach(d => fs.mkdirSync(path.join(expDir, d), { recursive: true }));

// WP-022 Navigation Store
fs.writeFileSync(path.join(expDir, 'navigation', 'RouterAdapter.ts'), `
export interface RouterAdapter {
  push: (path: string) => void;
  replace: (path: string) => void;
  onPathChange: (callback: (path: string) => void) => () => void;
}
`);

fs.writeFileSync(path.join(expDir, 'navigation', 'WorkspaceStore.ts'), `
import { create } from 'zustand';

export interface WorkspaceState {
  activeModule: string | null;
  sidebarExpanded: boolean;
  breadcrumbs: Array<{ label: string; path: string }>;
  
  // Semantic actions
  openWorkspace: (moduleId: string) => void;
  toggleSidebar: () => void;
  pinSidebar: (pinned: boolean) => void;
  setBreadcrumbs: (crumbs: Array<{ label: string; path: string }>) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeModule: null,
  sidebarExpanded: true,
  breadcrumbs: [],

  openWorkspace: (moduleId) => set({ activeModule: moduleId }),
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  pinSidebar: (pinned) => set({ sidebarExpanded: pinned }),
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
}));
`);

// WP-024 Command Palette Registry
fs.writeFileSync(path.join(expDir, 'commands', 'CommandRegistry.ts'), `
export interface CommandDefinition {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  shortcut?: string[];
  permissions?: string[];
  handler: () => void;
}

class CommandRegistryImpl {
  private commands = new Map<string, CommandDefinition>();
  private listeners = new Set<() => void>();

  register(command: CommandDefinition) {
    this.commands.set(command.id, command);
    this.notify();
  }

  unregister(id: string) {
    this.commands.delete(id);
    this.notify();
  }

  getCommands() {
    return Array.from(this.commands.values());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const CommandRegistry = new CommandRegistryImpl();
`);

// WP-025 Overlay Orchestration
fs.writeFileSync(path.join(expDir, 'overlays', 'OverlayService.ts'), `
export interface OverlayItem {
  id: string;
  type: 'toast' | 'dialog' | 'drawer' | 'popover';
  content: any; // ReactNode
  priority: number;
}

class OverlayServiceImpl {
  private activeOverlays: OverlayItem[] = [];
  
  open(overlay: Omit<OverlayItem, 'id'>) {
    const id = crypto.randomUUID();
    this.activeOverlays.push({ ...overlay, id });
    return id;
  }

  close(id: string) {
    this.activeOverlays = this.activeOverlays.filter(o => o.id !== id);
  }
}

export const OverlayService = new OverlayServiceImpl();
`);

// Advanced: Capability Registry
fs.writeFileSync(path.join(expDir, 'registry', 'CapabilityRegistry.ts'), `
export interface ProductCapability {
  id: string;
  name: string;
  navigationEntry?: { label: string; path: string; icon: string };
  panels?: Array<{ id: string; location: 'left' | 'right' | 'bottom'; component: any }>;
}

class CapabilityRegistryImpl {
  private capabilities = new Map<string, ProductCapability>();

  register(capability: ProductCapability) {
    this.capabilities.set(capability.id, capability);
  }

  getCapabilities() {
    return Array.from(this.capabilities.values());
  }
}

export const CapabilityRegistry = new CapabilityRegistryImpl();
`);

// Advanced: Lifecycle
fs.writeFileSync(path.join(expDir, 'lifecycle', 'LifecycleHooks.ts'), `
export const LifecycleEvents = {
  STARTUP: 'startup',
  WORKSPACE_SWITCH: 'workspace_switch',
  SHUTDOWN: 'shutdown'
} as const;

export const triggerLifecycleEvent = (event: keyof typeof LifecycleEvents, payload?: any) => {
  // Dispatches a custom DOM event or triggers internal listeners
  const customEvent = new CustomEvent(\`cerebro:\${LifecycleEvents[event]}\`, { detail: payload });
  window.dispatchEvent(customEvent);
};
`);

// Shell component placeholder
fs.writeFileSync(path.join(expDir, 'shell', 'WorkspaceShell.tsx'), `
import React from 'react';
import { useWorkspaceStore } from '../navigation/WorkspaceStore';

export const WorkspaceShell = ({ children }: { children: React.ReactNode }) => {
  const sidebarExpanded = useWorkspaceStore(s => s.sidebarExpanded);
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-primary)]">
      {/* TopBar */}
      {/* Sidebar (Dynamic Width) */}
      <aside style={{ width: sidebarExpanded ? '280px' : '64px' }} className="transition-all border-r border-[var(--color-border-default)]">
         {/* NavigationRail or Full Sidebar */}
      </aside>
      
      {/* Main WorkspaceHost */}
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
      
      {/* Auxiliary Panel & OverlayHost would go here */}
    </div>
  );
}
`);

// Index export
fs.writeFileSync(path.join(expDir, 'index.ts'), `
export * from './navigation/RouterAdapter';
export * from './navigation/WorkspaceStore';
export * from './commands/CommandRegistry';
export * from './overlays/OverlayService';
export * from './registry/CapabilityRegistry';
export * from './lifecycle/LifecycleHooks';
export * from './shell/WorkspaceShell';
`);

console.log('M2 Experience platform successfully scaffolded!');
